import { cacheGet, cacheSet, cacheDel, cacheFlush, isRedisAvailable } from '../config/redis';

export class CacheService {
  private prefix: string;

  constructor(prefix: string = 'jobboard') {
    this.prefix = prefix;
  }

  private buildKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);
    return cacheGet(fullKey);
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const fullKey = this.buildKey(key);
    await cacheSet(fullKey, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    await cacheDel(fullKey);
  }

  async flush(): Promise<void> {
    await cacheFlush();
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  isRedisAvailable(): boolean {
    return isRedisAvailable();
  }
}

export const defaultCache = new CacheService();