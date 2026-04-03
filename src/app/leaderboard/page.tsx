import { Metadata } from "next";
import Image from "next/image";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Leaderboard | Intern Community Hub",
  description: "Top 10 contributors this month ranked by approved submissions.",
};

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  approvedCount: number;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/leaderboard`, {
      next: { revalidate: 600 }, // ISR: 10 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    return await response.json();
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }
}

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "🎖️";
  }
}

function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return "from-yellow-100 to-yellow-50 border-yellow-200";
    case 2:
      return "from-gray-100 to-gray-50 border-gray-200";
    case 3:
      return "from-orange-100 to-orange-50 border-orange-200";
    default:
      return "from-white to-gray-50 border-gray-100";
  }
}

export default async function LeaderboardPage() {
  const leaderboard = await fetchLeaderboard();
  const now = new Date();
  const monthName = format(now, "MMMM yyyy");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">🏆 Leaderboard</h1>
        <p className="text-gray-600">
          Top contributors for <span className="font-semibold">{monthName}</span>
        </p>
        <p className="text-sm text-gray-500">
          Ranked by number of approved module submissions
        </p>
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No contributions this month yet.</p>
          <p className="mt-2 text-sm text-gray-400">
            Submit an approved module to appear on the leaderboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 rounded-lg border bg-gradient-to-r p-4 transition-shadow hover:shadow-md ${getRankColor(
                entry.rank
              )}`}
            >
              {/* Rank */}
              <div className="flex min-w-12 flex-col items-center justify-center">
                <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                <span className="text-xs font-bold text-gray-600">
                  #{entry.rank}
                </span>
              </div>

              {/* User Avatar & Info */}
              <div className="flex flex-1 items-center gap-3">
                {entry.image ? (
                  <Image
                    src={entry.image}
                    alt={entry.name || "User"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-semibold text-gray-600">
                      {entry.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {entry.name || "Anonymous User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.userId.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Submission Count */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {entry.approvedCount}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {entry.approvedCount === 1 ? "Module" : "Modules"}
                  </span>
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${(entry.approvedCount / Math.max(...leaderboard.map((e) => e.approvedCount))) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 How it works:</span> The leaderboard
          resets on the 1st of each month at 00:00 UTC. Only approved modules count
          towards your ranking. Data is cached for 10 minutes for optimal
          performance.
        </p>
      </div>
    </div>
  );
}