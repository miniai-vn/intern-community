import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/analytics — aggregate analytics for admin dashboard
export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Parallel queries for dashboard stats
  const [
    totalModules,
    totalViews,
    totalVotes,
    views24h,
    views7d,
    topModules,
    dailyViews,
  ] = await Promise.all([
    db.miniApp.count({ where: { status: "APPROVED" } }),
    db.moduleView.count(),
    db.vote.count(),
    db.moduleView.count({ where: { viewedAt: { gte: oneDayAgo } } }),
    db.moduleView.count({ where: { viewedAt: { gte: sevenDaysAgo } } }),

    // Top 10 modules by views with vote-to-view ratio
    db.miniApp.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        slug: true,
        voteCount: true,
        viewCount: true,
        _count: {
          select: {
            views: { where: { viewedAt: { gte: sevenDaysAgo } } },
          },
        },
      },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),

    // Views per day for last 7 days (raw SQL for date grouping)
    db.$queryRaw<Array<{ day: string; count: bigint }>>`
      SELECT
        TO_CHAR("viewedAt", 'YYYY-MM-DD') AS day,
        COUNT(*) AS count
      FROM module_views
      WHERE "viewedAt" >= ${sevenDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
  ]);

  return NextResponse.json({
    summary: {
      totalModules,
      totalViews,
      totalVotes,
      views24h,
      views7d,
    },
    topModules: topModules.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      voteCount: m.voteCount,
      viewCount: m.viewCount,
      views7d: m._count.views,
      // Vote-to-view ratio: how engaging is this module?
      engagementRate:
        m.viewCount > 0
          ? Math.round((m.voteCount / m.viewCount) * 10000) / 100
          : 0,
    })),
    dailyViews: dailyViews.map((d) => ({
      day: d.day,
      count: Number(d.count),
    })),
  });
}
