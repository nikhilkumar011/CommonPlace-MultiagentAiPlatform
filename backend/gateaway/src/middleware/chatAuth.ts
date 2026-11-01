import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SESSION_PREFIX = 'auth:session:';
const redisModuleUrl = pathToFileURL(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../shared/redis.js'),
).href;

interface RedisSessionClient {
  get(key: string): Promise<string | null>;
}

interface SharedRedisModule {
  ioRedis?: RedisSessionClient;
  default?: { ioRedis?: RedisSessionClient };
}

let redisClientPromise: Promise<RedisSessionClient> | undefined;

async function getRedisClient(): Promise<RedisSessionClient> {
  redisClientPromise ??= import(redisModuleUrl).then((loaded: SharedRedisModule) => {
    const redisClient = loaded.ioRedis ?? loaded.default?.ioRedis;
    if (!redisClient) {
      throw new Error('The shared Redis module does not export ioRedis');
    }
    return redisClient;
  });
  return redisClientPromise;
}

export async function requireChatAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.auth_token;
  if (typeof token !== 'string' || !token) {
    res.status(401).json({ message: 'Authentication cookie is required.' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    next(new Error('JWT_SECRET must be set in the environment'));
    return;
  }

  let payload: jwt.JwtPayload | string;
  try {
    payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }

  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    typeof payload.sid !== 'string'
  ) {
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }

  try {
    const sessionData = await (await getRedisClient()).get(
      `${SESSION_PREFIX}${payload.sid}`,
    );
    if (!sessionData) {
      res.status(401).json({ message: 'Session is invalid or expired.' });
      return;
    }

    const parsed: unknown = JSON.parse(sessionData);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('userId' in parsed) ||
      typeof parsed.userId !== 'string' ||
      parsed.userId !== payload.sub
    ) {
      res.status(401).json({ message: 'Session is invalid or expired.' });
      return;
    }

    req.headers['x-user-id'] = parsed.userId;
    next();
  } catch (error) {
    next(error);
  }
}
