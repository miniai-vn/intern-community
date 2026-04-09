import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get current month in UTC
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    
    // Create date range for current month (UTC)
    const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 1, 0, 0, 0, 0));

    // Query top 10 contributors by approved submissions this month
    const topContributors = await db.miniApp.groupBy({
      by: ['authorId'],
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get user details for each contributor
    const contributorsWithDetails = await Promise.all(
      topContributors.map(async (contributor, index) => {
        const user = await db.user.findUnique({
          where: { id: contributor.authorId },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });

        return {
          rank: index + 1,
          user: user || {
            id: contributor.authorId,
            name: 'Unknown User',
            image: null,
          },
          approvedCount: contributor._count.id,
        };
      })
    );

    return NextResponse.json({
      contributors: contributorsWithDetails,
      month: {
        year: currentYear,
        month: currentMonth + 1, // Convert 0-based to 1-based
        name: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
