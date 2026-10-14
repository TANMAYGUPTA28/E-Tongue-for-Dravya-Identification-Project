import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServerApp } from '../src/index.js';

describe('API Endpoint: POST /api/v1/agent/chat-sync', () => {
  const app = createServerApp();

  it('rejects invalid empty payload with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/v1/agent/chat-sync')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid role with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/v1/agent/chat-sync')
      .send({ message: 'test', role: 'invalid_role' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});
