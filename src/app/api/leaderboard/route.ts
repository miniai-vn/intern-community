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

export type LeaderboardResult = {
  data: LeaderboardEntry[];
  totalPages: number;
  currentPage: number;
};

const ITEMS_PER_PAGE = 10;

export async function getLeaderboardData(
  page: number = 1,
): Promise<LeaderboardResult> {
  const now = new Date();
  const startOfMonthUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );

  const totalGroups = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonthUTC },
    },
  });

  const totalAuthors = totalGroups.length;
  const totalPages = Math.ceil(totalAuthors / ITEMS_PER_PAGE) || 1;

  const skip = (page - 1) * ITEMS_PER_PAGE;

  const topContributors = await db.miniApp.groupBy({
    by: ["authorId"],
    _count: { id: true },
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonthUTC },
    },
    orderBy: { _count: { id: "desc" } },
    skip: skip,
    take: ITEMS_PER_PAGE,
  });

  if (topContributors.length === 0) {
    return { data: [], totalPages, currentPage: page };
  }

  const userIds = topContributors.map((c) => c.authorId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const mappedData = topContributors.map((contributor, index) => {
    const user = users.find((u) => u.id === contributor.authorId);
    return {
      rank: skip + index + 1,
      count: contributor._count.id,
      user: user || {
        id: contributor.authorId,
        name: "Unknown Developer",
        image: null,
      },
    };
  });

  return {
    data: mappedData,
    totalPages,
    currentPage: page,
  };
}
