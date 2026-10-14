import { describe, it, expect } from 'vitest';
import { GeminiProvider, GrokProvider, getLLMProvider } from '../src/agent/llm/provider.js';

describe('LLM Providers (Native fetch without external SDKs)', () => {
  it('throws an error if GEMINI_API_KEY is not defined', async () => {
    const provider = new GeminiProvider('');
    await expect(provider.chat([{ role: 'user', content: 'hello' }], [])).rejects.toThrow(
      'GEMINI_API_KEY is not defined'
    );
  });

  it('throws an error if GROK_API_KEY is not defined', async () => {
    const provider = new GrokProvider('');
    await expect(provider.chat([{ role: 'user', content: 'hello' }], [])).rejects.toThrow(
      'GROK_API_KEY is not defined'
    );
  });

  it('selects provider according to LLM_PROVIDER env variable', () => {
    process.env.LLM_PROVIDER = 'grok';
    const grok = getLLMProvider();
    expect(grok.name).toBe('grok');

    process.env.LLM_PROVIDER = 'gemini';
    const gemini = getLLMProvider();
    expect(gemini.name).toBe('gemini');
  });
});
