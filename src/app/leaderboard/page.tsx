import { db } from "@/lib/db";
import Image from "next/image";

export const revalidate = 600;

async function getLeaderboard() {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );

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

  return stats.map((s, index) => ({
    rank: index + 1,
    authorId: s.authorId,
    approvedCount: s._count.id,
    user: userMap.get(s.authorId) || null,
  }));
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Leaderboard
        </h1>
        <p className="text-gray-500">
          Top community contributors for the current calendar month.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No approved submissions this month yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <div
                key={entry.authorId}
                className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center font-bold text-gray-400">
                    #{entry.rank}
                  </div>
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 flex-shrink-0">
                    {entry.user?.image ? (
                      <Image
                        src={entry.user.image}
                        alt={entry.user.name || "Avatar"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {entry.user?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {entry.user?.name || "Anonymous User"}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {entry.approvedCount}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Submissions
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
