import Image from "next/image";
import { prisma } from "@/lib/prisma";

// Yêu cầu: Revalidate every 100 minutes (600 seconds)
export const revalidate = 600;

let totalCalls = 0;

async function getLeaderboardData() {
    totalCalls++;
    const startTime = performance.now(); // Bắt đầu bấm giờ
    const timestamp = new Date().toLocaleTimeString('vi-VN');

    console.log(`\n┌───────────────────────────────────────────────────┐`);
    console.log(`│ [CALL #${totalCalls}] - THỜI ĐIỂM GỌI: ${timestamp}  │`);
    console.log(`└───────────────────────────────────────────────────┘`);

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

    try {
        // Đo thời gian cụ thể cho câu query GroupBy
        const dbStart = performance.now();

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

        const users = await prisma.user.findMany({
            where: { id: { in: stats.map(s => s.authorId) } },
            select: { id: true, name: true, image: true }
        });

        const dbEnd = performance.now();

        const finalData = stats.map(s => ({
            ...users.find(u => u.id === s.authorId),
            count: s._count.authorId
        }));

        const totalTime = (performance.now() - startTime).toFixed(2);
        const dbTime = (dbEnd - dbStart).toFixed(2);

        // console.log(`-> Dữ liệu User trong DB:`, users.map(u => ({ name: u.name, img: u.image })));
        console.log(`⏱️ Thời gian truy vấn DB: ${dbTime}ms`);
        console.log(`⏱️ Tổng thời gian xử lý hàm: ${totalTime}ms`);
        console.log(`=== [CALL #${totalCalls}] KẾT THÚC ===\n`);

        return finalData;

    } catch (error) {
        console.error(`❌ [CALL #${totalCalls}] LỖI:`, error);
        throw error;
    }
}

export default async function LeaderboardPage() {
    const data = await getLeaderboardData();

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Top Contributors (Tháng này)</h1>
            <ul className="space-y-4">
                {data.map((user, index) => (
                    <li key={user.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg w-6">#{index + 1}</span>
                            <div className="relative w-10 h-10">
                                <Image
                                    src={user.image || "/default-avatar.jpg"}
                                    alt={user.name || ""}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <span className="font-medium">{user.name}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                            {user.count} Modules
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}