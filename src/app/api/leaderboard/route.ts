import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 600;

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));

  const stats = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonth },
    },
    _count: { id: true },
    orderBy: {
      _count: { id: "desc" },
    },
    take: 10,
  });

  const authorIds = stats.map((s) => s.authorId);

  const users = await db.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const leaderboard = stats.map((s, index) => ({
    rank: index + 1,
    authorId: s.authorId,
    approvedCount: s._count.id,
    user: userMap.get(s.authorId) || null,
  }));

  return NextResponse.json(leaderboard);
}
