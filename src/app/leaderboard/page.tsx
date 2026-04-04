import Image from "next/image";
import { db } from "@/lib/db";

/**
 * Contributor leaderboard — top 10 contributors for the current month
 *
 * Revalidates every 10 minutes (ISR) to keep data fresh without
 * overwhelming the database on high-traffic pages.
 *
 * Month calculation:
 * - Resets at UTC midnight on the 1st of each month
 * - Uses Date.UTC for consistent behavior across timezones
 */
export const revalidate = 600; // 10 minutes in seconds

export default async function LeaderboardPage() {
  // Calculate current month boundaries (UTC)
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
  const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59));

  // Fetch top 10 contributors for the current month
  // Group by author and count APPROVED submissions in the date range
  const topContributors = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  // Fetch user details for all contributors
  const contributorIds = topContributors.map((c) => c.authorId);
  const users = await db.user.findMany({
    where: {
      id: { in: contributorIds },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  // Create a map for quick lookup
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Merge contributor data with user details
  const leaderboardData = topContributors
    .map((contributor, index) => {
      const user = userMap.get(contributor.authorId);
      return {
        rank: index + 1,
        userId: contributor.authorId,
        name: user?.name || "Unknown",
        image: user?.image || null,
        approvedCount: contributor._count.id,
      };
    })
    .filter((entry) => entry.name !== "Unknown"); // Remove entries without user data

  const monthName = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            🏆 Contributor Leaderboard
          </h1>
          <p className="text-gray-600">
            Top contributors for {monthName}
          </p>
        </div>

        {/* Leaderboard */}
        {leaderboardData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              No approved modules submitted this month yet. Be the first!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboardData.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-lg shadow transition-colors ${
                  entry.rank <= 3
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <span
                    className={`text-lg font-bold ${
                      entry.rank === 1
                        ? "text-amber-600"
                        : entry.rank === 2
                          ? "text-gray-500"
                          : entry.rank === 3
                            ? "text-orange-600"
                            : "text-gray-400"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                      {entry.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name and Contribution Count */}
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{entry.name}</p>
                  <p className="text-sm text-gray-500">
                    {entry.approvedCount} approved{" "}
                    {entry.approvedCount === 1 ? "module" : "modules"}
                  </p>
                </div>

                {/* Medal or Count */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-2xl">
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : ""}
                  </span>
                  {entry.rank > 3 && (
                    <p className="text-sm font-semibold text-gray-600 mt-1">
                      {entry.approvedCount}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-4 bg-white rounded-lg shadow text-center text-sm text-gray-600">
          <p>
            🔄 Leaderboard updates every 10 minutes (UTC). Join the community and submit your modules!
          </p>
        </div>
      </div>
    </main>
  );
}
