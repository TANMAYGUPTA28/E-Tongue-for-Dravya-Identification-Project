import { z } from 'zod';

export type UserRole = 'admin' | 'technician' | 'researcher';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  allowedRoles?: UserRole[];
}

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCallRequest[];
}

export interface LLMProvider {
  name: string;
  chat(messages: ChatMessage[], tools: ToolDefinition[], stream?: boolean): Promise<LLMResponse>;
}

// Zod Schema for UI Widgets rendered by GenerativeRenderer
export const UIComponentSchema = z.object({
  type: z.enum([
    'line_chart',
    'bar_chart',
    'radar',
    'data_table',
    'stat_cards',
    'confidence_ring'
  ]),
  props: z.record(z.string(), z.any())
});

export type UIComponent = z.infer<typeof UIComponentSchema>;

// Contract for Final Orchestrator Response
export const AgentOutputSchema = z.object({
  text: z.string(),
  ui: z.array(UIComponentSchema).default([]),
  sources: z.array(z.string()).optional()
});

export type AgentOutput = z.infer<typeof AgentOutputSchema>;

export interface ToolExecutionContext {
  userRole: UserRole;
  userId?: string;
}
