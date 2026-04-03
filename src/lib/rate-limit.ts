// lib/rate-limit.ts
import { redis } from "./redis"; // kết nối Redis (Upstash)

export async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `rate:vote:${userId}`;
  const now = Date.now();

  // Xóa các vote cũ hơn 60s
  await redis.zremrangebyscore(key, 0, now - 60_000);

  // Đếm số vote hiện tại
  const count = await redis.zcard(key);

  if (count >= 10) return false; // quá giới hạn

  // Thêm vote mới vào sorted set
  await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` });

  // Expire key sau 61s để Redis tự dọn
  await redis.expire(key, 61);

  return true;
}