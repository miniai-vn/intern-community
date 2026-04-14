import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getCurrentUtcMonthRange() {
    const now = new Date();

    const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const end = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    return { start, end };
}

export async function GET() {
    try {
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
                _count: {
                    authorId: "desc",
                },
            },
            take: 10,
        });

        const users = await db.user.findMany({
            where: {
                id: {
                    in: grouped.map((item) => item.authorId),
                },
            },
            select: {
                id: true,
                name: true,
                image: true,
            },
        });

        const userMap = new Map(users.map((user) => [user.id, user]));

        const items = grouped.map((item, index) => ({
            rank: index + 1,
            approvedCount: item._count.authorId,
            user: userMap.get(item.authorId) ?? {
                id: item.authorId,
                name: "Unknown user",
                image: null,
            },
        }));

        return NextResponse.json({
            monthStartUtc: start.toISOString(),
            monthEndUtc: end.toISOString(),
            items,
        });
    } catch (error) {
        console.error("GET /api/leaderboard error:", error);

        return NextResponse.json(
            { error: "Failed to load leaderboard" },
            { status: 500 }
        );
    }
}