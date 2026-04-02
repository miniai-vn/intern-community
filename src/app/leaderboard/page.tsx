// Contributor leaderboard page
// Shows top 10 contributors ranked by approved submissions this calendar month.
// Uses ISR with revalidate: 600s (10 min) as required by the spec.
// "Current month" = UTC-month, resets automatically at month boundary.

import { db } from "@/lib/db";

export const revalidate = 600; // revalidate every 10 minutes

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string | null;
    image: string | null;
    approvedCount: number;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Start of current UTC month
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    // Single aggregation query — no N+1
    const rows = await db.miniApp.groupBy({
        by: ["authorId"],
        where: {
            status: "APPROVED",
            updatedAt: { gte: monthStart },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
    });

    if (rows.length === 0) return [];

    // Fetch author details in one query
    const authorIds = rows.map((r) => r.authorId);
    const authors = await db.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, name: true, image: true },
    });

    const authorMap = new Map(authors.map((a) => [a.id, a]));

    return rows.map((row, i) => {
        const author = authorMap.get(row.authorId);
        return {
            rank: i + 1,
            id: row.authorId,
            name: author?.name ?? "Unknown",
            image: author?.image ?? null,
            approvedCount: row._count.id,
        };
    });
}

function monthLabel(): string {
    return new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

const rankStyles: Record<number, string> = {
    1: "bg-yellow-400 text-yellow-900",
    2: "bg-gray-300 text-gray-800",
    3: "bg-amber-600 text-amber-100",
};

export default async function LeaderboardPage() {
    const entries = await getLeaderboard();

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Contributor Leaderboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Top contributors for {monthLabel()} — ranked by approved submissions.
                </p>
            </div>

            {entries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-500">No approved submissions this month yet.</p>
                    <p className="mt-1 text-sm text-gray-400">Be the first to contribute!</p>
                </div>
            ) : (
                <ol className="space-y-3">
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                        >
                            {/* Rank badge */}
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankStyles[entry.rank] ?? "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {entry.rank}
                            </span>

                            {/* Avatar */}
                            {entry.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={entry.image}
                                    alt={entry.name ?? "contributor"}
                                    className="h-9 w-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                                    {(entry.name ?? "?")[0]?.toUpperCase()}
                                </div>
                            )}

                            {/* Name */}
                            <span className="flex-1 text-sm font-medium text-gray-900">
                                {entry.name ?? "Anonymous"}
                            </span>

                            {/* Count */}
                            <span className="shrink-0 text-sm font-semibold text-blue-600">
                                {entry.approvedCount}{" "}
                                <span className="font-normal text-gray-400">
                                    {entry.approvedCount === 1 ? "submission" : "submissions"}
                                </span>
                            </span>
                        </li>
                    ))}
                </ol>
            )}

            <p className="text-center text-xs text-gray-400">
                Refreshes every 10 minutes · Resets on the 1st of each month (UTC)
            </p>
        </div>
    );
}
