import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/modules/trending — return top trending modules
// Trending score = votes × 0.4 + views_7d × 0.3 + recency × 0.3
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get approved modules with their 7-day view counts
  const modules = await db.miniApp.findMany({
    where: { status: "APPROVED" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      _count: {
        select: {
          views: { where: { viewedAt: { gte: sevenDaysAgo } } },
        },
      },
    },
  });

  // Calculate trending score for each module
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

  const scored = modules.map((m) => {
    const views7d = m._count.views;
    const ageMs = now - m.createdAt.getTime();
    // Recency: 1.0 for brand new, 0.0 for 30+ days old
    const recency = Math.max(0, 1 - ageMs / maxAge);

    const score = m.voteCount * 0.4 + views7d * 0.3 + recency * 0.3;

    return { ...m, views7d, trendingScore: Math.round(score * 100) / 100 };
  });

  // Sort by trending score descending
  scored.sort((a, b) => b.trendingScore - a.trendingScore);
  const top = scored.slice(0, limit);

  // Fetch voted status for current user
  const session = await auth();
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: top.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = top.map(({ _count, ...m }) => ({
    ...m,
    hasVoted: votedIds.has(m.id),
  }));

  return NextResponse.json({ items });
}
