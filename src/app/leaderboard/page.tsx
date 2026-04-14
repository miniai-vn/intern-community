import Link from "next/link";

export const revalidate = 600;

interface LeaderboardItem {
    rank: number;
    approvedCount: number;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

async function getLeaderboard(): Promise<LeaderboardItem[]> {
    const baseUrl = "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/leaderboard`, {
        next: { revalidate: 600 },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
    }

    const data = await res.json();
    return data.items;
}

export default async function LeaderboardPage() {
    const items = await getLeaderboard();

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                    Contributor Leaderboard
                </h1>
                <p className="text-sm text-gray-500">
                    Top contributors by approved module submissions this month.
                </p>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                    <p className="text-gray-500">
                        No approved submissions yet this month.
                    </p>
                    <Link
                        href="/"
                        className="mt-2 block text-sm text-blue-600 hover:underline"
                    >
                        Browse modules
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="grid grid-cols-[80px_1fr_120px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                        <span>Rank</span>
                        <span>Contributor</span>
                        <span className="text-right">Approved</span>
                    </div>

                    <div>
                        {items.map((item) => (
                            <div
                                key={item.user.id}
                                className="grid grid-cols-[80px_1fr_120px] items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-b-0"
                            >
                                <span className="text-sm font-semibold text-gray-900">
                                    #{item.rank}
                                </span>

                                <div className="flex items-center gap-3">
                                    {item.user.image ? (
                                        <img
                                            src={item.user.image}
                                            alt={item.user.name ?? "Contributor avatar"}
                                            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                                            {(item.user.name ?? "?").charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <p className="font-medium text-gray-900">
                                        {item.user.name ?? "Unknown user"}
                                    </p>
                                </div>

                                <span className="text-right text-sm font-semibold text-blue-600">
                                    {item.approvedCount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}