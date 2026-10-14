import { describe, it, expect } from 'vitest';
import { runAgentChat } from '../src/agent/orchestrator.js';
import { LLMProvider, ChatMessage, ToolDefinition, LLMResponse } from '../src/agent/types.js';

class MockLLMProvider implements LLMProvider {
  name = 'mock';
  private step = 0;

  async chat(messages: ChatMessage[], tools: ToolDefinition[]): Promise<LLMResponse> {
    this.step++;
    if (this.step === 1) {
      // Simulate tool call to get_samples
      return {
        content: '',
        toolCalls: [
          {
            id: 'call_1',
            name: 'get_samples',
            arguments: { status: 'SUSPECT_ADULTERATED' }
          }
        ]
      };
    } else {
      // Return structured JSON adhering to output contract
      return {
        content: JSON.stringify({
          text: '2 suspect adulterated samples found in QC registry.',
          ui: [
            {
              type: 'data_table',
              props: {
                headers: ['Sample ID', 'Dravya', 'Status'],
                rows: [['SMP-082', 'Ashwagandha', 'SUSPECT_ADULTERATED']]
              }
            }
          ],
          sources: ['get_samples']
        })
      };
    }
  }
}

describe('Orchestrator: Tool Loop & Output Contract', () => {
  it('executes tool loop and returns validated output contract', async () => {
    const mockProvider = new MockLLMProvider();
    const result = await runAgentChat({
      userMessage: 'aaj ke suspect samples dikhao',
      userRole: 'researcher',
      provider: mockProvider
    });

    expect(result.text).toContain('suspect adulterated');
    expect(result.ui.length).toBe(1);
    expect(result.ui[0].type).toBe('data_table');
    expect(result.sources).toContain('get_samples');
  });

  it('safely repairs malformed markdown JSON', async () => {
    const markdownProvider: LLMProvider = {
      name: 'markdown_mock',
      async chat(): Promise<LLMResponse> {
        return {
          content: '```json\n{"text": "Markdown formatted output", "ui": [], "sources": []}\n```'
        };
      }
    };

    const result = await runAgentChat({
      userMessage: 'status batao',
      provider: markdownProvider
    });

    expect(result.text).toBe('Markdown formatted output');
    expect(result.ui).toEqual([]);
  });
});
