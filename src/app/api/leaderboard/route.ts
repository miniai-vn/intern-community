import { db } from "@/lib/db";

export type LeaderboardEntry = {
  rank: number;
  count: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const now = new Date();
  const startOfMonthUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );

  const topContributors = await db.miniApp.groupBy({
    by: ["authorId"],
    _count: { id: true },
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonthUTC },
    },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  if (topContributors.length === 0) return [];

  const userIds = topContributors.map((c) => c.authorId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  return topContributors.map((contributor, index) => {
    const user = users.find((u) => u.id === contributor.authorId);
    return {
      rank: index + 1,
      count: contributor._count.id,
      user: user || {
        id: contributor.authorId,
        name: "Unknown Developer",
        image: null,
      },
    };
  });
}
