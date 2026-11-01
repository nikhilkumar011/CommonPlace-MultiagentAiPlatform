import Redis from 'ioredis';

export const ioRedis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379',
);

ioRedis.on('error', (error) => {
  console.error('Redis client error:', error);
});

export default ioRedis;