import express from 'express';
import cors from 'cors';
import { agentRouter } from './agent/router.js';

export function createServerApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Mount agent routes
  app.use('/api/v1/agent', agentRouter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'E-Tongue Agentic Platform' });
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const app = createServerApp();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[E-Tongue Server] Running on http://localhost:${PORT}`);
  });
}
