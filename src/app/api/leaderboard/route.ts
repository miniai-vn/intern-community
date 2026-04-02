import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const revalidate = 600; // ISR: revalidate every 10 minutes (600 seconds)

export async function GET() {
  // Get current month's first day (UTC midnight)
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const leaderboard = await db.user.findMany({
    where: {
      submissions: {
        some: {
          status: "APPROVED",
          createdAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      submissions: {
        where: {
          status: "APPROVED",
          createdAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
        select: { id: true },
      },
    },
  });

  // Calculate approved count and sort
  const ranked = leaderboard
    .map((user) => ({
      id: user.id,
      name: user.name || "Anonymous",
      avatar: user.image || null,
      approvedCount: user.submissions.length,
    }))
    .filter((user) => user.approvedCount > 0)
    .sort((a, b) => b.approvedCount - a.approvedCount)
    .slice(0, 10);

  return NextResponse.json({
    items: ranked,
    month: `${startOfMonth.getUTCFullYear()}-${String(startOfMonth.getUTCMonth() + 1).padStart(2, "0")}`,
    updatedAt: new Date().toISOString(),
  });
}