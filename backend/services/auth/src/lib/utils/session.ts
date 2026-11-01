import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SESSION_PREFIX = 'auth:session:';
const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours in seconds
const redisModuleUrl = pathToFileURL(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../shared/redis.js'),
).href;

interface RedisSessionClient {
  set(key: string, value: string, expiryMode: 'EX', seconds: number): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  profilePic: string;
}

interface UserSession {
  userId: string;
  user: SessionUser;
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

function isSessionUser(value: unknown): value is SessionUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.profilePic === 'string'
  );
}

function parseUserSession(value: string): UserSession | null {
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const session = parsed as Record<string, unknown>;
  if (
    typeof session.userId !== 'string' ||
    !isSessionUser(session.user) ||
    session.user.id !== session.userId
  ) {
    return null;
  }

  return { userId: session.userId, user: session.user };
}

export async function createUserSession(user: SessionUser): Promise<string> {
  const sessionId = randomUUID();
  const session: UserSession = { userId: user.id, user };
  const result = await (await getRedisClient()).set(
    `${SESSION_PREFIX}${sessionId}`,
    JSON.stringify(session),
    'EX',
    SESSION_TTL_SECONDS,
  );

  if (result !== 'OK') {
    throw new Error('Redis did not confirm the user session was stored');
  }

  return sessionId;
}

export async function getUserSession(sessionId: string): Promise<UserSession | null> {
  const value = await (await getRedisClient()).get(`${SESSION_PREFIX}${sessionId}`);
  if (!value) {
    return null;
  }

  return parseUserSession(value);
}

export async function deleteUserSession(sessionId: string): Promise<void> {
  await (await getRedisClient()).del(`${SESSION_PREFIX}${sessionId}`);
}
