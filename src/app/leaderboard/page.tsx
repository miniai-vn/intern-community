import { db } from "@/lib/db";
import { getCurrentUtcMonthRange, formatUtcMonthLabel } from "@/lib/leaderboard";

export const revalidate = 600;

export default async function LeaderboardPage() {
  const { start, end } = getCurrentUtcMonthRange();

const grouped = await db.miniApp.groupBy({
  by: ["authorId"],
  where: {
    status: "APPROVED",
    createdAt: {
      gte: start,
      lt: end,
    },
  },
  _count: {
    authorId: true,
  },
  orderBy: {
    authorId: "asc",
  },
});

const authorIds = grouped.map((item) => item.authorId);

const users = await db.user.findMany({
  where: {
    id: {
      in: authorIds,
    },
  },
  select: {
    id: true,
    name: true,
    image: true,
  },
});

const usersMap = new Map(users.map((user) => [user.id, user]));

const leaderboard = grouped
  .map((item) => {
    const user = usersMap.get(item.authorId);

    return {
      authorId: item.authorId,
      name: user?.name ?? "Unknown contributor",
      image: user?.image ?? null,
      approvedCount: item._count.authorId,
    };
  })
  .sort((a, b) => b.approvedCount - a.approvedCount)
  .slice(0, 10)
  .map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
const monthLabel = formatUtcMonthLabel();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contributor Leaderboard</h1>
        <p className="text-sm text-gray-500">
          Top contributors for {monthLabel} (UTC), ranked by approved module submissions.
        </p>
      </div>

            {leaderboard.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No approved submissions yet for this UTC month.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
              {[2, 1, 3].map((rankNumber) => {
                const entry = topThree.find((item) => item.rank === rankNumber);
                if (!entry) return <div key={rankNumber} />;

                const heightClass =
                  entry.rank === 1
                    ? "h-40"
                    : entry.rank === 2
                    ? "h-28"
                    : "h-24";

                const badgeClass =
                  entry.rank === 1
                    ? "bg-yellow-100 text-yellow-700"
                    : entry.rank === 2
                    ? "bg-gray-200 text-gray-700"
                    : "bg-orange-100 text-orange-700";

                return (
                  <div
                    key={entry.authorId}
                    className={`flex flex-col items-center ${
                      entry.rank === 1 ? "md:-order-none" : ""
                    }`}
                  >
                    <div className="mb-3 flex flex-col items-center text-center">
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="mb-3 h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-600">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div
                        className={`mb-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        #{entry.rank}
                      </div>

                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-sm text-gray-500">
                        {entry.approvedCount} approved submission
                        {entry.approvedCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div
                      className={`flex w-full max-w-[180px] items-center justify-center rounded-t-2xl bg-blue-100 text-lg font-bold text-blue-700 ${heightClass}`}
                    >
                      {entry.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {rest.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="divide-y divide-gray-200">
                {rest.map((entry) => (
                  <div
                    key={entry.authorId}
                    className="flex items-center gap-4 px-4 py-4 sm:px-6"
                  >
                    <div className="w-8 text-sm font-semibold text-gray-500">
                      #{entry.rank}
                    </div>

                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt={entry.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="font-medium text-gray-900">{entry.name}</p>
                      <p className="text-sm text-gray-500">
                        {entry.approvedCount} approved submission
                        {entry.approvedCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}