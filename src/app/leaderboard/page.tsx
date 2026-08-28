import { db } from "@/lib/db";
import { formatUtcMonthLabel, getCurrentUtcMonthRange } from "@/lib/time";

export const revalidate = 600; // 10 phút

type LeaderboardRow = {
    rank: number;
    userId: string;
    name: string;
    image: string | null;
    approvedCount: number;
};

async function getLeaderboardData(): Promise<LeaderboardRow[]> {
    const { start, end } = getCurrentUtcMonthRange();

    const grouped = await db.miniApp.groupBy({
        by: ["authorId"],
        where: {
            status: "APPROVED",
            updatedAt: {
                gte: start,
                lt: end,
            },
        },
        _count: {
            _all: true,
        },
        orderBy: {
            _count: {
                authorId: "desc",
            },
        },
        take: 10,
    });

    if (grouped.length === 0) return [];

    const users = await db.user.findMany({
        where: { id: { in: grouped.map((g) => g.authorId) } },
        select: { id: true, name: true, image: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return grouped.map((g, idx) => {
        const user = userMap.get(g.authorId);
        return {
            rank: idx + 1,
            userId: g.authorId,
            name: user?.name ?? "Unknown user",
            image: user?.image ?? null,
            approvedCount: g._count._all,
        };
    });
}

export default async function LeaderboardPage() {
    const rows = await getLeaderboardData();
    const monthLabel = formatUtcMonthLabel();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Contributor Leaderboard</h1>
                <p className="text-sm text-gray-500">
                    Top contributors for {monthLabel} (UTC month window).
                </p>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-500">No approved submissions yet this month.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <ul className="divide-y divide-gray-100">
                        {rows.map((row) => (
                            <li key={row.userId} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 text-sm font-semibold text-gray-700">#{row.rank}</span>
                                    {row.image ? (
                                        <img
                                            src={row.image}
                                            alt={`${row.name} avatar`}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-200" aria-hidden="true" />
                                    )}
                                    <span className="font-medium text-gray-900">{row.name}</span>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {row.approvedCount} approved
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}