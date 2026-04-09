import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/modules/trending — return top trending modules
// Trending score = votes × 0.4 + views_7d × 0.3 + recency × 0.3
// Uses raw SQL to compute scores in the database instead of loading all rows into JS.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Compute trending score entirely in PostgreSQL:
  // - LEFT JOIN to count 7-day views per module (avoids loading all rows)
  // - Recency: linear decay from 1.0 (new) to 0.0 (30+ days old)
  // - Final score sorted and limited in DB — O(n log n) in DB vs O(n) memory in JS
  const trending: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    repoUrl: string;
    demoUrl: string | null;
    voteCount: number;
    viewCount: number;
    createdAt: Date;
    categoryId: string;
    authorId: string;
    views7d: bigint;
    trendingScore: number;
  }> = await db.$queryRaw`
    SELECT
      m.id, m.slug, m.name, m.description,
      m."repoUrl", m."demoUrl",
      m."voteCount", m."viewCount", m."createdAt",
      m."categoryId", m."authorId",
      COALESCE(v.cnt, 0) AS "views7d",
      (
        m."voteCount" * 0.4
        + COALESCE(v.cnt, 0) * 0.3
        + GREATEST(0, 1.0 - EXTRACT(EPOCH FROM (NOW() - m."createdAt")) / ${30 * 24 * 3600}) * 0.3
      ) AS "trendingScore"
    FROM mini_apps m
    LEFT JOIN (
      SELECT "moduleId", COUNT(*)::int AS cnt
      FROM module_views
      WHERE "viewedAt" >= ${sevenDaysAgo}
      GROUP BY "moduleId"
    ) v ON v."moduleId" = m.id
    WHERE m.status = 'APPROVED'
    ORDER BY "trendingScore" DESC
    LIMIT ${limit}
  `;

  // Batch-fetch related category + author to avoid N+1
  const categoryIds = [...new Set(trending.map((m) => m.categoryId))];
  const authorIds = [...new Set(trending.map((m) => m.authorId))];

  const [categories, authors] = await Promise.all([
    db.category.findMany({ where: { id: { in: categoryIds } } }),
    db.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true, image: true },
    }),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  // Fetch voted status for current user
  const session = await auth();
  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: trending.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const items = trending.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    description: m.description,
    repoUrl: m.repoUrl,
    demoUrl: m.demoUrl,
    voteCount: m.voteCount,
    viewCount: m.viewCount,
    createdAt: m.createdAt,
    views7d: Number(m.views7d),
    trendingScore: Math.round(Number(m.trendingScore) * 100) / 100,
    category: categoryMap.get(m.categoryId)!,
    author: authorMap.get(m.authorId)!,
    hasVoted: votedIds.has(m.id),
  }));

  return NextResponse.json({ items });
}
