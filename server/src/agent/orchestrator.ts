import {
  ChatMessage,
  AgentOutput,
  AgentOutputSchema,
  ToolExecutionContext,
  LLMProvider
} from './types.js';
import { getLLMProvider } from './llm/provider.js';
import { getAllToolDefinitions, executeToolByName } from './tools/index.js';

const SYSTEM_PROMPT = `You are Dravya AI, an autonomous Ayurvedic Quality Control & Chemometrics Assistant for the E-Tongue Project.
CRITICAL OPERATING RULES:
1. Answer ONLY using data returned by your available tools. Never invent sample numbers, batches, or confidence percentages.
2. If no matching records are returned by tools, state clearly "data nahi mila" or "No records found matching criteria".
3. Reply in the language used by the user (English or Hinglish are both supported).
4. Always append a concise QC disclaimer: "Notice: E-Tongue chemometrics data is for laboratory quality control and herbal research, not medical advice."
5. Output format must STRICTLY be a valid JSON object matching this schema:
{
  "text": "Your textual explanation here (in English or Hinglish)",
  "ui": [
    {
      "type": "data_table",
      "props": { "headers": ["Sample ID", "Dravya", "Status", "Confidence"], "rows": [...] }
    }
  ],
  "sources": ["get_samples"]
}
Do NOT wrap your JSON in markdown code fences (\`\`\`json). Return raw JSON only.`;

export interface RunAgentOptions {
  userMessage: string;
  userRole?: 'admin' | 'technician' | 'researcher';
  userId?: string;
  provider?: LLMProvider;
  maxIterations?: number;
  timeoutMs?: number;
}

export type SSECallback = (event: 'tool_start' | 'tool_end' | 'delta' | 'final' | 'error', data: any) => void;

/**
 * Streaming Agent Orchestrator with real-time SSE event dispatch
 */
export async function runAgentChatStream(
  options: RunAgentOptions,
  onEvent: SSECallback
): Promise<AgentOutput> {
  const {
    userMessage,
    userRole = 'researcher',
    userId = 'usr_default',
    maxIterations = 5,
    timeoutMs = 30000
  } = options;

  const provider = options.provider || getLLMProvider();
  const context: ToolExecutionContext = { userRole, userId };
  const tools = getAllToolDefinitions();

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage }
  ];

  let iterations = 0;
  const startTime = Date.now();

  try {
    while (iterations < maxIterations) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Agent execution timed out after ${timeoutMs}ms.`);
      }

      iterations++;
      const response = await provider.chat(messages, tools, false);

      // If no tool calls, model provided final text output
      if (!response.toolCalls || response.toolCalls.length === 0) {
        const finalOutput = await parseAndValidateOutput(response.content, messages, provider);
        onEvent('final', finalOutput);
        return finalOutput;
      }

      // Record assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: response.content || '',
        tool_calls: response.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments)
          }
        }))
      });

      // Execute each tool and stream tool_start / tool_end events
      for (const toolCall of response.toolCalls) {
        onEvent('tool_start', {
          tool: toolCall.name,
          arguments: toolCall.arguments
        });

        let toolResult: any;
        try {
          toolResult = await executeToolByName(toolCall.name, toolCall.arguments, context);
        } catch (err: any) {
          toolResult = { error: err.message || 'Tool execution failed' };
        }

        onEvent('tool_end', {
          tool: toolCall.name,
          result: toolResult
        });

        messages.push({
          role: 'tool',
          name: toolCall.name,
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }
    }

    throw new Error(`Exceeded maximum tool loop limit of ${maxIterations} iterations.`);
  } catch (err: any) {
    onEvent('error', { message: err.message || 'Agent Orchestration Error' });
    throw err;
  }
}

/**
 * Synchronous non-streaming runAgentChat
 */
export async function runAgentChat(options: RunAgentOptions): Promise<AgentOutput> {
  let finalResult: AgentOutput = { text: '', ui: [], sources: [] };
  await runAgentChatStream(options, (event, data) => {
    if (event === 'final') {
      finalResult = data;
    }
  });
  return finalResult;
}

/**
 * Validates output JSON against AgentOutputSchema.
 * If invalid, performs exactly 1 repair retry prompt before falling back safely.
 */
async function parseAndValidateOutput(
  rawContent: string,
  history: ChatMessage[],
  provider: LLMProvider
): Promise<AgentOutput> {
  let cleaned = rawContent.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return AgentOutputSchema.parse(parsed);
  } catch (err) {
    // Exactly 1 repair retry
    try {
      const repairPrompt = `Your previous output was not valid JSON matching the required schema: ${err}. Please repair and output strictly valid JSON with { "text": string, "ui": Array, "sources": Array }.`;
      const retryResponse = await provider.chat(
        [
          ...history,
          { role: 'assistant', content: rawContent },
          { role: 'user', content: repairPrompt }
        ],
        [],
        false
      );

      let retryCleaned = retryResponse.content.trim();
      if (retryCleaned.startsWith('```json')) {
        retryCleaned = retryCleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (retryCleaned.startsWith('```')) {
        retryCleaned = retryCleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const retryParsed = JSON.parse(retryCleaned);
      return AgentOutputSchema.parse(retryParsed);
    } catch (repairErr) {
      // Fallback safely to plain text
      return {
        text: rawContent || 'Notice: Chemometrics quality verification complete.',
        ui: [],
        sources: []
      };
    }
  }
}
