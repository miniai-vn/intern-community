import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const rows = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonth },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  if (rows.length === 0) return NextResponse.json({ contributors: [] });

  const authorIds = rows.map((r) => r.authorId);
  const users = await db.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u] as const));

  const contributors = rows.map((row, i) => {
    const user = userMap.get(row.authorId);
    return {
      rank: i + 1,
      userId: row.authorId,
      name: user?.name ?? "Unknown",
      image: user?.image ?? null,
      approvedCount: row._count.id,
    };
  });

  return NextResponse.json({ contributors });
}
