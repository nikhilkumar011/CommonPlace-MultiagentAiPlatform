import express from 'express';
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chatRoutes from './routes/chatRoutes.js';
import { connectToDatabase } from './lib/db.js';

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env'),
});

const app = express();
const port = Number(process.env.CHAT_SERVICE_PORT ?? 3002);

app.use(express.json({ limit: '12mb' }));
app.use('/', chatRoutes);

async function startServer(): Promise<void> {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Chat service is running on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start chat service:', error);
  process.exitCode = 1;
});
