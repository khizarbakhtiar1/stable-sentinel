import { CacheManager, getCache, resetCache } from '../utils/cache';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager(60, true);
  });

  afterEach(() => {
    cache.clear();
  });

  it('should set and get values', () => {
    cache.set('key1', 'value1');
    expect(cache.get<string>('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get<string>('nonexistent')).toBeUndefined();
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete keys', () => {
    cache.set('key1', 'value1');
    cache.delete('key1');
    expect(cache.get<string>('key1')).toBeUndefined();
  });

  it('should clear all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.get<string>('key1')).toBeUndefined();
    expect(cache.get<string>('key2')).toBeUndefined();
  });

  it('should return stats', () => {
    const stats = cache.getStats();
    expect(stats).toBeDefined();
    expect(stats.keys).toBe(0);
  });

  it('should generate cache keys', () => {
    const key = CacheManager.generateKey('prefix', 'part1', 'part2');
    expect(key).toBe('prefix:part1:part2');
  });

  it('should not store values when disabled', () => {
    const disabledCache = new CacheManager(60, false);
    disabledCache.set('key1', 'value1');
    expect(disabledCache.get<string>('key1')).toBeUndefined();
    expect(disabledCache.has('key1')).toBe(false);
    expect(disabledCache.set('key1', 'value1')).toBe(false);
  });
});

describe('getCache / resetCache', () => {
  afterEach(() => {
    resetCache();
  });

  it('should create a new cache when params provided', () => {
    const cache1 = getCache(30, true);
    cache1.set('key', 'val');
    const cache2 = getCache(60, true);
    // New instance should not have the key from old
    expect(cache2.get('key')).toBeUndefined();
  });

  it('should return existing instance when no params', () => {
    const cache1 = getCache(30, true);
    cache1.set('key', 'val');
    const cache2 = getCache();
    expect(cache2.get<string>('key')).toBe('val');
  });

  it('should reset cache', () => {
    const cache = getCache(30, true);
    cache.set('key', 'val');
    resetCache();
    const newCache = getCache();
    expect(newCache.get('key')).toBeUndefined();
  });
});
