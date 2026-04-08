import { db } from "@/lib/db";
import Image from "next/image";

// ISR: Revalidate every 10 minutes (600 seconds)
export const revalidate = 600;

interface LeaderboardEntry {
  rank: number;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  approvedCount: number;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Get current month boundaries (UTC)
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
  const monthEnd = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

  // Query: Get all users with their approved modules count in current month
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      submissions: {
        where: {
          status: "APPROVED",
          updatedAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        select: { id: true },
      },
    },
  });

  // Filter users with at least 1 approved module, calculate count, and sort
  const leaderboardData = users
    .filter((user) => user.submissions.length > 0)
    .map((user) => ({
      authorId: user.id,
      authorName: user.name,
      authorImage: user.image,
      approvedCount: user.submissions.length,
    }))
    .sort((a, b) => b.approvedCount - a.approvedCount)
    .slice(0, 10);

  // Add rank numbers
  const entries: LeaderboardEntry[] = leaderboardData.map((data, index) => ({
    rank: index + 1,
    ...data,
  }));

  return entries;
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
          <p className="text-lg text-gray-600">Top contributors this month</p>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.authorId}
                className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                {/* Rank + Avatar + Name */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                    </span>
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.authorImage ? (
                      <Image
                        src={entry.authorImage}
                        alt={entry.authorName || "Author"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm text-gray-600">?</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{entry.authorName || "Anonymous"}</p>
                    </div>
                  </div>
                </div>

                {/* Approved Count */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-blue-600">{entry.approvedCount}</div>
                  <div className="text-sm text-gray-500">
                    {entry.approvedCount === 1 ? "module" : "modules"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No approved modules yet this month. Come back soon! 😊</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Data refreshes every 10 minutes. Ranking resets on the 1st of each month.
          </p>
        </div>
      </div>
    </div>
  );
}
