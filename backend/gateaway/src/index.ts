import express from 'express'
import dotenv from 'dotenv'
import proxy from 'express-http-proxy'
import cookieParser from 'cookie-parser'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireChatAuth } from './middleware/chatAuth.js'

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env'),
});

const app = express();

function logAgentRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const startedAt = Date.now();
  console.info(`[gateway] ${req.method} ${req.originalUrl} started`);
  res.on('finish', () => {
    console.info(
      `[gateway] ${req.method} ${req.originalUrl} completed with ${res.statusCode} in ${Date.now() - startedAt}ms`,
    );
  });
  res.on('close', () => {
    if (!res.writableFinished) {
      console.warn(
        `[gateway] ${req.method} ${req.originalUrl} closed before completion after ${Date.now() - startedAt}ms`,
      );
    }
  });
  next();
}

app.use('/auth', proxy(`http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`));
app.use(cookieParser());
app.use(
  '/chat',
  requireChatAuth,
  proxy(`http://localhost:${process.env.CHAT_SERVICE_PORT || 3002}`, {
    limit: '12mb',
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      const userId = srcReq.get('x-user-id');
      if (!userId) {
        throw new Error('Authenticated user ID is missing from chat proxy request');
      }
      proxyReqOpts.headers['x-user-id'] = userId;
      return proxyReqOpts;
    },
  }),
);
app.use(
  '/agent',
  logAgentRequest,
  requireChatAuth,
  proxy(`http://localhost:${process.env.AGENT_SERVICE_PORT || 3003}`, {
    limit: '12mb',
    proxyErrorHandler(error, res) {
      console.error('[gateway] Agent upstream proxy failed:', error);
      if (!res.headersSent) {
        const status = error?.code === 'ECONNRESET' ? 504 : 502;
        res.status(status).json({
          message:
            status === 504
              ? 'The agent service did not complete the request in time.'
              : 'The gateway could not reach the agent service.',
        });
      }
    },
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      const userId = srcReq.get('x-user-id');
      if (!userId) {
        throw new Error('Authenticated user ID is missing from agent proxy request');
      }
      proxyReqOpts.headers['x-user-id'] = userId;
      return proxyReqOpts;
    },
  }),
);


const PORT = process.env.GATEAWAY_PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from the gateway!');
});

app.listen(PORT, () => {
  console.log(`Gateway is running on port ${PORT}`);
})
