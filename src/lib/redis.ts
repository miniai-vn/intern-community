import Redis from "ioredis";

// Initialize Redis client with fallback configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  // { changed code } Remove lazyConnect to allow automatic connection
  lazyConnect: false, // Allow automatic connection on initialization
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: false,
  enableOfflineQueue: true, // Allow queueing commands while connecting
  maxRetriesPerRequest: null, // Important for connection stability
  // { changed code }
});

// Handle connection errors gracefully
redis.on("error", (err) => {
  console.warn("[Redis] Connection error (app will fallback to DB):", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully");
});

/**
 * Get cached data from Redis
 * Returns null if Redis is unavailable or key doesn't exist
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    if (!redis.status || redis.status === "close") {
      console.warn(`[Redis] Client not ready, skipping cache for key: ${key}`);
      return null;
    }

    const cached = await redis.get(key);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as T;
  } catch (error) {
    console.warn(`[Redis] Failed to get cache for key ${key}:`, error);
    return null; // Fallback gracefully
  }
}

/**
 * Set data in Redis with TTL (Time-To-Live)
 * Returns false if Redis is unavailable
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300 // Default 5 minutes
): Promise<boolean> {
  try {
    if (!redis.status || redis.status === "close") {
      console.warn(`[Redis] Client not ready, skipping cache set for key: ${key}`);
      return false;
    }

    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`[Redis] Failed to set cache for key ${key}:`, error);
    return false; // Fallback gracefully
  }
}

/**
 * Delete a cache key (used for invalidation)
 * Returns false if Redis is unavailable
 */
export async function deleteCachedData(key: string): Promise<boolean> {
  try {
    if (!redis.status || redis.status === "close") {
      console.warn(`[Redis] Client not ready, skipping cache delete for key: ${key}`);
      return false;
    }

    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`[Redis] Failed to delete cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Clear all cache keys matching a pattern (useful for bulk invalidation)
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  try {
    if (!redis.status || redis.status === "close") {
      console.warn(`[Redis] Client not ready, skipping pattern invalidation: ${pattern}`);
      return 0;
    }

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.warn(`[Redis] Failed to invalidate pattern ${pattern}:`, error);
    return 0;
  }
}

export default redis;