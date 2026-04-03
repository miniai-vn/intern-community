import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times) => Math.min(times * 50, 2000),
  connectTimeout: 10000,
  enableReadyCheck: true,
  // Đổi thành true để ioredis tự đợi kết nối rồi mới chạy lệnh
  enableOfflineQueue: true, 
  maxRetriesPerRequest: null, // Để ioredis tự quản lý việc retry lệnh
});

const checkConnection = () => redis.status === "ready" || redis.status === "connect";

let isRedisReady = false;

redis.on("ready", () => {
  isRedisReady = true;
  console.log("[Redis] Connected and ready");
});

redis.on("error", (err) => {
  const error = err as NodeJS.ErrnoException;
  isRedisReady = false;
  
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    console.warn(
      "[Redis] Connection error (app will fallback to DB):",
      error.message
    );
  } else {
    console.error("[Redis] Unexpected error:", error);
  }
});

redis.on("close", () => {
  isRedisReady = false;
  console.warn("[Redis] Connection closed");
});

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    // Nếu redis đang đóng hẳn (end), không gọi nữa
    if (redis.status === "end") return null;

    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("[Redis] Get failed:", error);
    return null;
  }
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    if (!isRedisReady) {
      return false;
    }

    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    console.log(
      `[Redis] Cached key: ${key} with TTL: ${ttlSeconds}s`
    );
    return true;
  } catch (error) {
    console.warn("[Redis] Set failed:", error);
    return false;
  }
}

export async function deleteCachedData(key: string): Promise<boolean> {
  try {
    if (!isRedisReady) {
      return false;
    }

    await redis.del(key);
    return true;
  } catch (error) {
    console.warn("[Redis] Delete failed:", error);
    return false;
  }
}

export async function invalidateCachePattern(
  pattern: string
): Promise<number> {
  try {
    if (!isRedisReady) {
      return 0;
    }

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    console.warn("[Redis] Pattern invalidation failed:", error);
    return 0;
  }
}

export default redis;