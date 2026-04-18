import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const stats = await prisma.miniApp.groupBy({
        by: ['authorId'],
        where: {
            status: 'APPROVED',
            updatedAt: { gte: startOfMonth },
        },
        _count: { authorId: true },
        orderBy: { _count: { authorId: 'desc' } },
        take: 10,
    });

    const userIds = stats.map(s => s.authorId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, image: true }
    });

    const leaderboard = stats.map(s => ({
        ...users.find(u => u.id === s.authorId),
        count: s._count.authorId
    }));

    return NextResponse.json(leaderboard);
}