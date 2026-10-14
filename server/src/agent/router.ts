import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { runAgentChat, runAgentChatStream } from './orchestrator.js';

export const agentRouter = Router();

const ChatRequestSchema = z.object({
  message: z.string().optional(),
  query: z.string().optional(),
  role: z.enum(['admin', 'technician', 'researcher']).default('researcher').optional(),
  userId: z.string().optional()
}).refine((data) => (data.message && data.message.trim().length > 0) || (data.query && data.query.trim().length > 0), {
  message: 'Either message or query must be provided'
});

/**
 * POST /api/v1/agent/chat
 * Server-Sent Events (SSE) streaming endpoint
 * Emits events: tool_start, tool_end, delta, final, error
 */
agentRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: parsed.error.issues
    });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const userMessage = (parsed.data.message || parsed.data.query)!.trim();
  const { role, userId } = parsed.data;

  try {
    await runAgentChatStream(
      {
        userMessage,
        userRole: role,
        userId
      },
      (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    );
  } catch (err: any) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: err.message || 'Stream processing failed' })}\n\n`);
  } finally {
    res.end();
  }
  return;
});

/**
 * POST /api/v1/agent/chat-sync
 * Synchronous non-streaming endpoint
 */
agentRouter.post('/chat-sync', async (req: Request, res: Response) => {
  try {
    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.issues
      });
    }

    const userMessage = (parsed.data.message || parsed.data.query)!.trim();
    const { role, userId } = parsed.data;
    const output = await runAgentChat({
      userMessage,
      userRole: role,
      userId
    });

    return res.status(200).json(output);
  } catch (err: any) {
    return res.status(500).json({
      error: 'AGENT_ERROR',
      message: err.message || 'Internal Agent Orchestration Failure'
    });
  }
});
