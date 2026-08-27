import { prisma } from "./prisma";

export type LeaderboardEntry = {
    id: string;
    name: string | null;
    image: string | null;
    count: number;      // Number of Modules Approved
    totalVotes: number; // Total votes for all modules (Tie-breaker)
};

// Requirement: Revalidate every 10 minutes (600 seconds)
export const LEADERBOARD_REVALIDATE = 600; //constant for Next.js segment config

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
    const now = new Date();
    /**
     * Uses Date.UTC() instead of plain new Date() to avoid timezone
     * discrepancies across environments (server, local dev, CI...).
     *
     * Example: if now = 2026-04-18T10:30:00Z
     *   → startOfMonth = 2026-04-01T00:00:00.000Z
     *
     * Typically used to filter records created within the current month,
     * e.g. WHERE createdAt >= startOfMonth (monthly leaderboard).
     */
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    // 1. GroupBy is used to count the number of modules and the total number of votes for each author
    const stats = await prisma.miniApp.groupBy({
        by: ['authorId'],
        where: {
            status: 'APPROVED',
            createdAt: { gte: startOfMonth, lt: startOfNextMonth },
        },
        _count: { authorId: true },
        _sum: { voteCount: true }, // Tie-breaker
        orderBy: [
            { _count: { authorId: 'desc' } },    // Priority 1: Number of modules
            { _sum: { voteCount: 'desc' } },   // Priority 2: Total votes (Tie-breaker)
            { authorId: 'asc' }
        ],
        take: 10,
    });

    // 2. Get information of User
    const users = await prisma.user.findMany({
        where: { id: { in: stats.map(s => s.authorId) } },
        select: { id: true, name: true, image: true }
    });

    // 3. Combine data and reformat
    const finalData = stats
        .map(s => {
            const user = users.find(u => u.id === s.authorId);
            if (!user) return null;
            return {
                ...user,
                count: s._count.authorId,
                totalVotes: s._sum.voteCount || 0
            };
        })
        .filter((entry): entry is LeaderboardEntry => entry !== null);

    return finalData;
}