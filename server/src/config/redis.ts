import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: Redis | null = null;
let memoryCache = new Map<string, { value: any; expires: number }>();

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 100, 3000);
      },
    });

    redisClient.on('error', (err) => {
      console.warn('Redis connection error, falling back to in-memory cache:', err.message);
      redisClient = null;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    return redisClient;
  } catch (err) {
    console.warn('Failed to create Redis client, using in-memory cache:', err);
    return null;
  }
}

export function isRedisAvailable(): boolean {
  const client = getRedisClient();
  return client !== null && client.status === 'ready';
}

// Fallback in-memory cache functions
export async function cacheGet(key: string): Promise<any> {
  const client = getRedisClient();
  if (client && client.status === 'ready') {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('Redis get failed, falling back to memory:', err);
    }
  }

  const item = memoryCache.get(key);
  if (item && item.expires > Date.now()) {
    return item.value;
  }
  memoryCache.delete(key);
  return null;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  const client = getRedisClient();
  const serialized = JSON.stringify(value);

  if (client && client.status === 'ready') {
    try {
      await client.setex(key, ttlSeconds, serialized);
      return;
    } catch (err) {
      console.warn('Redis set failed, falling back to memory:', err);
    }
  }

  memoryCache.set(key, {
    value,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheDel(key: string): Promise<void> {
  const client = getRedisClient();
  if (client && client.status === 'ready') {
    try {
      await client.del(key);
    } catch (err) {
      console.warn('Redis del failed, falling back to memory:', err);
    }
  }
  memoryCache.delete(key);
}

export async function cacheFlush(): Promise<void> {
  const client = getRedisClient();
  if (client && client.status === 'ready') {
    try {
      await client.flushall();
    } catch (err) {
      console.warn('Redis flush failed, clearing memory:', err);
    }
  }
  memoryCache.clear();
}