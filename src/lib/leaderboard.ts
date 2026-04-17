import { db } from "@/lib/db";

export const LEADERBOARD_LIMIT = 10;

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  approvedSubmissions: number;
};

export type MonthlyLeaderboard = {
  monthLabelUtc: string;
  monthStartIso: string;
  monthEndIso: string;
  contributors: LeaderboardEntry[];
};

export function getCurrentUtcMonthRange(now: Date = new Date()) {
  const monthStartUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const nextMonthStartUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );

  return {
    monthStartUtc,
    nextMonthStartUtc,
  };
}

function getUtcMonthLabel(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);
}

export async function getCurrentMonthLeaderboard(
  limit: number = LEADERBOARD_LIMIT,
): Promise<MonthlyLeaderboard> {
  const { monthStartUtc, nextMonthStartUtc } = getCurrentUtcMonthRange();

  const groupedContributors = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: {
        gte: monthStartUtc,
        lt: nextMonthStartUtc,
      },
    },
    _count: { id: true },
    orderBy: [{ _count: { id: "desc" } }, { authorId: "asc" }],
    take: limit,
  });

  if (groupedContributors.length === 0) {
    return {
      monthLabelUtc: getUtcMonthLabel(),
      monthStartIso: monthStartUtc.toISOString(),
      monthEndIso: nextMonthStartUtc.toISOString(),
      contributors: [],
    };
  }

  const contributors = await db.user.findMany({
    where: {
      id: {
        in: groupedContributors.map((group) => group.authorId),
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  const contributorById = new Map(contributors.map((user) => [user.id, user]));

  return {
    monthLabelUtc: getUtcMonthLabel(),
    monthStartIso: monthStartUtc.toISOString(),
    monthEndIso: nextMonthStartUtc.toISOString(),
    contributors: groupedContributors.map((group, index) => {
      const user = contributorById.get(group.authorId);

      return {
        rank: index + 1,
        userId: group.authorId,
        name: user?.name ?? "Unknown",
        avatarUrl: user?.image ?? null,
        approvedSubmissions: group._count.id,
      };
    }),
  };
}
