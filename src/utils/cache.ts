import NodeCache from 'node-cache';

/**
 * Cache manager for storing price data and other temporary information
 */
export class CacheManager {
  private cache: NodeCache;
  private enabled: boolean;

  constructor(ttlSeconds: number = 60, enabled: boolean = true) {
    this.enabled = enabled;
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache
   */
  set(key: string, value: any, ttl?: number): boolean {
    if (!this.enabled) return false;
    return this.cache.set(key, value, ttl || 0);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    if (!this.enabled) return false;
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Generate cache key
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

/**
 * Global cache instance
 */
let cacheInstance: CacheManager | null = null;

/**
 * Get or create cache instance
 * When ttl/enabled are provided, always creates a new instance
 */
export function getCache(ttl?: number, enabled?: boolean): CacheManager {
  if (ttl !== undefined || enabled !== undefined) {
    if (cacheInstance) {
      cacheInstance.clear();
    }
    cacheInstance = new CacheManager(ttl, enabled);
  }
  if (!cacheInstance) {
    cacheInstance = new CacheManager();
  }
  return cacheInstance;
}

/**
 * Reset cache instance
 */
export function resetCache(): void {
  if (cacheInstance) {
    cacheInstance.clear();
  }
  cacheInstance = null;
}

