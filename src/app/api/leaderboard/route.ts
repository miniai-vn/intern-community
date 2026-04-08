import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import redis, { getCachedData, setCachedData } from "@/lib/redis";
import { randomUUID } from "crypto";

const LEADERBOARD_CACHE_KEY = "cache:leaderboard:current";
const LOCK_KEY = "lock:leaderboard:refresh";
const CACHE_TTL = 600;
const LOCK_TTL = 5;

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  approvedCount: number;
}

interface CachedLeaderboard {
  month: string;
  data: LeaderboardEntry[];
}

function log(level: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "leaderboard",
    message,
    ...meta,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { startOfMonth, startOfNextMonth };
}

function assignRanks(entries: Omit<LeaderboardEntry, "rank">[]): LeaderboardEntry[] {
  if (entries.length === 0) return [];
  let currentRank = 1;
  let i = 0;
  const ranked: LeaderboardEntry[] = [];
  while (i < entries.length) {
    const currentCount = entries[i].approvedCount;
    let j = i;
    while (j < entries.length && entries[j].approvedCount === currentCount) j++;
    const tieCount = j - i;
    for (let k = i; k < j; k++) {
      ranked.push({ ...entries[k], rank: currentRank });
    }
    currentRank += tieCount;
    i = j;
  }
  return ranked;
}

async function fetchLeaderboardFromDB(): Promise<LeaderboardEntry[]> {
  const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();
  log("info", "Fetching from DB", { startOfMonth, startOfNextMonth });

  const aggregations = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _count: { authorId: true },
    orderBy: { _count: { authorId: "desc" } },
    take: 10,
  });

  if (aggregations.length === 0) {
    log("info", "No approved submissions");
    return [];
  }

  const userIds = aggregations.map((a) => a.authorId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const rawEntries = aggregations.map((a) => ({
    userId: a.authorId,
    name: userMap.get(a.authorId)?.name ?? null,
    image: userMap.get(a.authorId)?.image ?? null,
    approvedCount: a._count.authorId,
  }));

  return assignRanks(rawEntries);
}

async function acquireLock(token: string): Promise<boolean> {
  try {
    const result = await redis.set(LOCK_KEY, token, "EX", LOCK_TTL, "NX");
    return result === "OK";
  } catch (err) {
    log("warn", "Lock acquire error", { error: String(err) });
    return false;
  }
}

async function releaseLock(token: string): Promise<void> {
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  try {
    await redis.eval(script, 1, LOCK_KEY, token);
  } catch (err) {
    log("warn", "Lock release error", { error: String(err) });
  }
}

async function waitWithBackoff(attempt: number): Promise<void> {
  const delay = Math.min(50 * Math.pow(2, attempt), 200);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const currentMonth = getCurrentMonthString();

  let cached: CachedLeaderboard | null = null;
  try {
    cached = await getCachedData<CachedLeaderboard>(LEADERBOARD_CACHE_KEY);
  } catch (err) {
    log("warn", "Redis read failed", { error: String(err) });
  }
  if (cached?.month === currentMonth) {
    log("info", "Cache HIT", { month: currentMonth });
    return cached.data;
  }
  log("info", "Cache MISS", { cachedMonth: cached?.month, currentMonth });

  const myToken = randomUUID();
  const locked = await acquireLock(myToken);
  if (locked) {
    try {
      log("info", "Lock acquired, refreshing cache");
      const leaderboard = await fetchLeaderboardFromDB();
      const toCache: CachedLeaderboard = { month: currentMonth, data: leaderboard };
      try {
        await setCachedData(LEADERBOARD_CACHE_KEY, toCache, CACHE_TTL);
        log("info", "Cache stored", { ttl: CACHE_TTL });
      } catch (err) {
        log("warn", "Redis write failed", { error: String(err) });
      }
      return leaderboard;
    } finally {
      await releaseLock(myToken);
    }
  } else {
    log("info", "Lock not acquired, retrying cache read");
    for (let attempt = 1; attempt <= 3; attempt++) {
      await waitWithBackoff(attempt);
      try {
        const retryCache = await getCachedData<CachedLeaderboard>(LEADERBOARD_CACHE_KEY);
        if (retryCache?.month === currentMonth) {
          log("info", "Cache populated by other instance after retry", { attempt });
          return retryCache.data;
        }
      } catch (err) {
        log("warn", "Retry cache read failed", { error: String(err), attempt });
      }
    }
    log("info", "Falling back to DB after retries exhausted");
    return await fetchLeaderboardFromDB();
  }
}

export async function GET(request: NextRequest) {
  try {
    const data = await getLeaderboard();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    log("error", "API error", { error: String(error) });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}