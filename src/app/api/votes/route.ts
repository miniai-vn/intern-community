import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/votes
 * Giới hạn: 10 requests / 1 phút mỗi người dùng
 */
export async function POST(req: NextRequest) {
  // 1. Xác thực người dùng
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const WINDOW_MS = 60 * 1000; // 1 phút
  const MAX_REQUESTS = 10;
  const windowStart = new Date(Date.now() - WINDOW_MS);

  try {
    // 2. Kiểm tra Rate Limit 
    const requestCount = await db.rateLimitEvent.count({
      where: {
        userId,
        action: "VOTE",
        createdAt: { gte: windowStart },
      },
    });

    if (requestCount >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many votes. Please wait a moment." },
        { status: 429 }
      );
    }

    // 3. Lấy dữ liệu từ body
    const { moduleId } = await req.json();
    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    // 4. Kiểm tra trạng thái vote hiện tại
    const existing = await db.vote.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });

    if (existing) {
      // --- TRƯỜNG HỢP: UN-VOTE ---
      try {
        await db.$transaction([
          db.vote.delete({ where: { id: existing.id } }),
          db.miniApp.update({
            where: { id: moduleId },
            data: { voteCount: { decrement: 1 } },
          }),
          // Ghi log để tính vào rate limit
          db.rateLimitEvent.create({ data: { userId, action: "VOTE" } }),
        ]);
        return NextResponse.json({ voted: false });
      } catch (error: any) {
        // Xử lý Race Condition: Nếu bản ghi đã bị xóa bởi request song song khác
        if (error.code === 'P2025') {
          return NextResponse.json({ voted: false });
        }
        throw error;
      }
    } else {
      // --- TRƯỜNG HỢP: VOTE MỚI ---
      await db.$transaction([
        db.vote.create({
          data: { userId, moduleId },
        }),
        db.miniApp.update({
          where: { id: moduleId },
          data: { voteCount: { increment: 1 } },
        }),
        // Ghi log để tính vào rate limit
        db.rateLimitEvent.create({ data: { userId, action: "VOTE" } }),
      ]);
      return NextResponse.json({ voted: true });
    }
  } catch (error) {
    console.error("[VOTE_API_ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}