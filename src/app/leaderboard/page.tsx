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
    <div className="mx-auto max-w-4xl space-y-10 pb-16 pt-8 px-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pb-2 drop-shadow-sm">
          Monthly Leaderboard
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Honoring the top community contributors who drive our ecosystem forward. The ranking fiercely resets every calendar month.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100/80 bg-white/60 backdrop-blur-xl overflow-hidden shadow-2xl ring-1 ring-black/5">
        {leaderboard.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 mb-6 shadow-inner">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">It's quiet in here...</h3>
            <p className="text-gray-500 mt-2">No approved submissions this month yet. Be the first to claim the #1 spot!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => {
              let rankStyle = "text-gray-400 font-medium text-lg";
              let badgeColor = "bg-gray-100 ring-gray-200 text-gray-500";

              if (entry.rank === 1) {
                rankStyle = "text-amber-500 font-black text-2xl drop-shadow-md";
                badgeColor = "bg-gradient-to-br from-amber-200 to-yellow-400 ring-yellow-300 text-yellow-900";
              } else if (entry.rank === 2) {
                rankStyle = "text-slate-400 font-black text-2xl drop-shadow-sm";
                badgeColor = "bg-gradient-to-br from-slate-200 to-gray-300 ring-gray-200 text-gray-800";
              } else if (entry.rank === 3) {
                rankStyle = "text-orange-500 font-black text-2xl drop-shadow-sm";
                badgeColor = "bg-gradient-to-br from-orange-200 to-amber-600 ring-orange-200 text-orange-950";
              }

              return (
                <div
                  key={entry.authorId}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-7 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/40 transition-all duration-300 ease-out"
                >
                  <div className="flex items-center gap-5 sm:gap-6">
                    <div className={`flex w-10 justify-center ${rankStyle} transform transition-transform group-hover:scale-110`}>
                      #{entry.rank}
                    </div>
                    
                    <div className={`relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-offset-2 flex-shrink-0 transition-transform duration-300 group-hover:rotate-3 ${badgeColor}`}>
                      {entry.user?.image ? (
                        <Image
                          src={entry.user.image}
                          alt={entry.user.name || "Avatar"}
                          width={56}
                          height={56}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-extrabold text-xl opacity-90">
                          {entry.user?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl group-hover:text-blue-700 transition-colors">
                        {entry.user?.name || "Anonymous Developer"}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right flex flex-col items-start sm:items-end mt-4 sm:mt-0 ml-16 sm:ml-0">
                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-violet-600 transform transition-transform duration-300 group-hover:scale-105">
                      {entry.approvedCount}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">
                      Submissions
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
