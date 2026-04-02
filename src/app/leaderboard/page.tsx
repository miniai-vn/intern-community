import { db } from "@/lib/db";

export const revalidate = 600;

export default async function LeaderboardPage() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const topAuthors = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonth },
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

  const users = await db.user.findMany({
    where: { id: { in: topAuthors.map((a) => a.authorId) } },
  });

  // Map user data back to the grouped stats to keep the ordered array
  const leaderboard = topAuthors.map((authorData, index) => {
    const user = users.find((u) => u.id === authorData.authorId);
    return {
      rank: index + 1,
      id: user?.id,
      name: user?.name || "Unknown",
      image: user?.image,
      approvedCount: authorData._count.id,
    };
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-12 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Top Contributors
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Honoring our most active community members with the highest number of approved module submissions this month.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_120px] items-center p-5 border-b border-gray-100 bg-gray-50/80 text-xs tracking-wider uppercase font-bold text-gray-500">
          <div className="text-center">Rank</div>
          <div>Contributor</div>
          <div className="text-right">Approved</div>
        </div>

        {leaderboard.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No submissions yet</h3>
            <p className="text-gray-500">Be the first to get a module approved this month!</p>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {leaderboard.map((entry) => (
            <div
              key={entry.id || entry.rank}
              className="grid grid-cols-[80px_1fr_120px] items-center p-5 hover:bg-gray-50 transition duration-150 ease-in-out group"
            >
              <div className="text-center">
                {entry.rank === 1 ? (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm shadow-sm border border-yellow-200">1</span>
                ) : entry.rank === 2 ? (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm shadow-sm border border-gray-200">2</span>
                ) : entry.rank === 3 ? (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100/50 text-amber-700 font-bold text-sm shadow-sm border border-amber-200/50">3</span>
                ) : (
                  <span className="font-mono font-semibold text-gray-400 text-lg group-hover:text-gray-600 transition-colors">
                    #{entry.rank}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="h-12 w-12 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm border-2 border-white">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {entry.name}
                  </div>
                  {entry.rank === 1 && (
                    <div className="text-xs font-semibold text-yellow-600 mt-0.5 tracking-wide uppercase">
                      Top Contributor
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right pr-2">
                <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold">
                  {entry.approvedCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
