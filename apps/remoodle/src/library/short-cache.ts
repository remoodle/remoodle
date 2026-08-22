import { LRUCache } from "lru-cache";
import { config } from "../config";

export interface ShortCache {
  get<T>(key: string): Promise<T | null>;
  put<T>(key: string, value: T): Promise<void>;
  has(key: string): Promise<boolean>;
  getOrPut<T>(key: string, load: () => Promise<T>): Promise<T>;
}

class MemoryShortCache implements ShortCache {
  private readonly cache: LRUCache<string, any>;

  constructor(ttlSeconds: number) {
    this.cache = new LRUCache<string, any>({
      max: 500,
      ttl: ttlSeconds * 1000,
    });
  }

  async get<T>(key: string) {
    return (this.cache.get(key) as T | undefined) ?? null;
  }

  async put<T>(key: string, value: T) {
    this.cache.set(key, value);
  }

  async has(key: string) {
    return this.cache.has(key);
  }

  async getOrPut<T>(key: string, load: () => Promise<T>) {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await load();
    await this.put(key, value);
    return value;
  }
}

export function createShortCache(): ShortCache {
  return new MemoryShortCache(config.cache.shortCacheTtlSeconds);
}
