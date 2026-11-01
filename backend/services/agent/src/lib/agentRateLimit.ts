import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { AgentRoute } from '../graph/state.js';

const WINDOW_MILLISECONDS = 60_000;
const redisModuleUrl = pathToFileURL(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../../shared/redis.js'),
).href;

const routeLimits: Record<AgentRoute, number> = {
  chat: 10,
  coding: 5,
  image: 1,
  pdf: 1,
  search: 2,
};

interface RedisRateLimitClient {
  eval(
    script: string,
    numberOfKeys: number,
    ...args: Array<string | number>
  ): Promise<unknown>;
}

interface SharedRedisModule {
  ioRedis?: RedisRateLimitClient;
  default?: RedisRateLimitClient;
}

let redisClientPromise: Promise<RedisRateLimitClient> | undefined;

async function getRedisClient(): Promise<RedisRateLimitClient> {
  redisClientPromise ??= import(redisModuleUrl).then((loaded: SharedRedisModule) => {
    const redisClient = loaded.ioRedis ?? loaded.default;
    if (!redisClient) {
      throw new Error('The shared Redis module does not export a Redis client');
    }
    return redisClient;
  });
  return redisClientPromise;
}

export class AgentRateLimitError extends Error {
  readonly statusCode = 429;

  constructor(
    readonly route: AgentRoute,
    readonly limit: number,
    readonly retryAfterSeconds: number,
  ) {
    super(
      `Rate limit reached for the ${route} agent (${limit} requests per minute). Try again in ${retryAfterSeconds} seconds.`,
    );
    this.name = 'AgentRateLimitError';
  }
}

const incrementWindowScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return { count, redis.call('PTTL', KEYS[1]) }
`;

export async function enforceAgentRateLimit(
  userId: string,
  route: AgentRoute,
): Promise<void> {
  const userKey = createHash('sha256').update(userId).digest('hex');
  const key = `agent:rate-limit:${userKey}:${route}`;
  const result = await (await getRedisClient()).eval(
    incrementWindowScript,
    1,
    key,
    WINDOW_MILLISECONDS,
  );

  if (
    !Array.isArray(result) ||
    typeof result[0] !== 'number' ||
    typeof result[1] !== 'number'
  ) {
    throw new Error('Redis returned an invalid agent rate-limit result');
  }

  const [count, ttl] = result;
  const limit = routeLimits[route];
  if (count > limit) {
    throw new AgentRateLimitError(
      route,
      limit,
      Math.max(1, Math.ceil(ttl / 1_000)),
    );
  }
}
