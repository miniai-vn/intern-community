import { db } from "@/lib/db";
import { Award, Medal, Trophy } from "lucide-react";

export const revalidate = 600; // ISR: revalidate every 10 minutes

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  approvedCount: number;
}

async function getLeaderboard(): Promise<{
  items: LeaderboardUser[];
  month: string;
  updatedAt: string;
}> {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const leaderboard = await db.user.findMany({
    where: {
      submissions: {
        some: {
          status: "APPROVED",
          createdAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      submissions: {
        where: {
          status: "APPROVED",
          createdAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
        select: { id: true },
      },
    },
  });

  const ranked = leaderboard
    .map((user) => ({
      id: user.id,
      name: user.name || "Anonymous",
      avatar: user.image || null,
      approvedCount: user.submissions.length,
    }))
    .filter((user) => user.approvedCount > 0)
    .sort((a, b) => b.approvedCount - a.approvedCount)
    .slice(0, 10);

  const month = `${startOfMonth.getUTCFullYear()}-${String(startOfMonth.getUTCMonth() + 1).padStart(2, "0")}`;

  return {
    items: ranked,
    month,
    updatedAt: new Date().toISOString(),
  };
}

export default async function LeaderboardPage() {
  const { items, month, updatedAt } = await getLeaderboard();

  const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-500">{rank}</span>;
  }
};

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Contributor Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Top contributors for {month} | Updated every 10 minutes
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No approved submissions yet this month.</p>
          <p className="mt-1 text-sm text-gray-400">Be the first to contribute!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-200">
            {items.map((user, index) => {
                const rank = index + 1;
                return (
                    <div
                    key={user.id}
                    className={`flex items-center gap-4 px-6 py-4 ${
                        rank <= 3 ? "bg-gradient-to-r from-yellow-50/30 to-transparent" : ""
                    }`}
                    >
                    {/*RANK */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        {getRankIcon(rank)}
                    </div>

                    {/* Avatar */}
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                        ...
                    </div>

                    {/* Tên */}
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                    </div>

                    {/* Số lượng */}
                    <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{user.approvedCount}</p>
                        <p className="text-xs text-gray-400">
                        approved {user.approvedCount === 1 ? "module" : "modules"}
                        </p>
                    </div>
                    </div>
                );
                })}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Rankings reset on the 1st of each month (UTC)
      </p>
    </div>
  );
}