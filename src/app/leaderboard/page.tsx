import { db } from "@/lib/db";

export const revalidate = 600; // 10 minutes ISR

export default async function LeaderboardPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const modules = await db.miniApp.groupBy({
    by: ['authorId'],
    where: {
      status: 'APPROVED',
      createdAt: { gte: firstDayOfMonth },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const authorIds = modules.map(m => m.authorId);
  const users = await db.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, image: true },
  });

  const leaderboard = modules.map((m) => {
    const user = users.find(u => u.id === m.authorId);
    return {
      authorId: m.authorId,
      name: user?.name ?? "Unknown",
      count: m._count.id,
    };
  });

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Top Contributors This Month</h1>
      {leaderboard.length === 0 ? (
        <p className="text-gray-500">No approved submissions this month yet.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {leaderboard.map((u, i) => (
            <div key={u.authorId} className="flex items-center justify-between border-b border-gray-200 p-4 last:border-0 hover:bg-gray-50">
              <span className="font-medium text-gray-900">{i + 1}. {u.name}</span>
              <span className="text-sm font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-full">{u.count} modules</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
