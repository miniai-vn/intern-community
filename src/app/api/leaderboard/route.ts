import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUtcMonthRange } from "@/lib/time";

export async function GET() {
    const { start, end } = getCurrentUtcMonthRange();

    // 1) Group theo authorId trong tháng UTC hiện tại
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

    if (grouped.length === 0) {
        return NextResponse.json({
            monthStartUtc: start.toISOString(),
            monthEndUtc: end.toISOString(),
            items: [],
        });
    }

    // 2) Lấy user info theo batch (tránh N+1)
    const users = await db.user.findMany({
        where: {
            id: { in: grouped.map((g) => g.authorId) },
        },
        select: {
            id: true,
            name: true,
            image: true,
        },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const items = grouped.map((g, index) => {
        const user = userMap.get(g.authorId);

        return {
            rank: index + 1,
            userId: g.authorId,
            name: user?.name ?? "Unknown user",
            image: user?.image ?? null,
            approvedCount: g._count._all,
        };
    });

    return NextResponse.json({
        monthStartUtc: start.toISOString(),
        monthEndUtc: end.toISOString(),
        items,
    });
}