import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runAgentChatStream } from '../src/agent/orchestrator.js';
import { LLMProvider, ChatMessage, ToolDefinition, LLMResponse } from '../src/agent/types.js';
import { createServerApp } from '../src/index.js';

class MockStreamingLLMProvider implements LLMProvider {
  name = 'mock_stream';
  private step = 0;

  async chat(messages: ChatMessage[], tools: ToolDefinition[]): Promise<LLMResponse> {
    this.step++;
    if (this.step === 1) {
      return {
        content: '',
        toolCalls: [
          {
            id: 'call_stream_1',
            name: 'get_samples',
            arguments: { dravya: 'Tulsi' }
          }
        ]
      };
    } else {
      return {
        content: JSON.stringify({
          text: 'Tulsi batch #TUL-09 verified pure.',
          ui: [
            {
              type: 'confidence_ring',
              props: { confidence: 96.4, label: 'Purity Score' }
            }
          ],
          sources: ['get_samples']
        })
      };
    }
  }
}

describe('Phase 3: SSE Streaming Architecture', () => {
  it('emits tool_start, tool_end, and final events in correct sequence', async () => {
    const events: Array<{ type: string; data: any }> = [];
    const mockProvider = new MockStreamingLLMProvider();

    const result = await runAgentChatStream(
      {
        userMessage: 'Tulsi ka status batao',
        userRole: 'researcher',
        provider: mockProvider
      },
      (eventType, data) => {
        events.push({ type: eventType, data });
      }
    );

    expect(events.length).toBeGreaterThanOrEqual(3);

    // Verify tool_start
    const toolStart = events.find((e) => e.type === 'tool_start');
    expect(toolStart).toBeDefined();
    expect(toolStart?.data.tool).toBe('get_samples');

    // Verify tool_end
    const toolEnd = events.find((e) => e.type === 'tool_end');
    expect(toolEnd).toBeDefined();
    expect(toolEnd?.data.tool).toBe('get_samples');
    expect(toolEnd?.data.result.samples.length).toBeGreaterThan(0);

    // Verify final
    const finalEvent = events.find((e) => e.type === 'final');
    expect(finalEvent).toBeDefined();
    expect(finalEvent?.data.text).toContain('Tulsi batch');
    expect(finalEvent?.data.ui[0].type).toBe('confidence_ring');

    expect(result.text).toBe(finalEvent?.data.text);
  });

  it('serves HTTP 200 with text/event-stream header on POST /api/v1/agent/chat', async () => {
    const app = createServerApp();
    const res = await request(app)
      .post('/api/v1/agent/chat')
      .send({ query: 'Tulsi sample status' })
      .expect(200);

    expect(res.headers['content-type']).toContain('text/event-stream');
  });
});
