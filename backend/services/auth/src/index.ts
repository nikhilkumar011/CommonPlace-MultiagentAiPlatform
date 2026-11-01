import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import { connectToDatabase } from './lib/db.js';

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env'),
});

const app = express();

const PORT = Number(process.env.AUTH_SERVICE_PORT ?? 3001);



app.use(express.json());
app.use(cookieParser());
app.use('/', authRoutes);

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in the environment');
  }

  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start auth service:', error);
  process.exitCode = 1;
});