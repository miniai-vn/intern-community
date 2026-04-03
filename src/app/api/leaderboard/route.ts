import { ModuleStatus } from "./../../../types/index";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { limitSchema, periodSchema } from "@/lib/validations";

// validate year-month
export function parseAndValidatePeriod(periodParam: string | null) {
  const now = new Date();

  if (!periodParam) {
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  }

  try {
    // Validate with Zod
    const validated = periodSchema.parse(periodParam ?? undefined);

    const [yearStr, monthStr] = validated.split("-");

    return { year: Number(yearStr), month: Number(monthStr) };
  } catch (err) {
    return null;
  }
}
// GET /api/leaderboard?period=2026-04&limit=10 — list
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  //
  const limitResult = limitSchema.safeParse(
    url.searchParams.get("limit") ?? undefined,
  );
  if (!limitResult.success) {
    return NextResponse.json(
      { error: limitResult.error.issues[0].message },
      { status: 400 },
    );
  }
  const parsed = parseAndValidatePeriod(url.searchParams.get("period"));
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid period, expected format: YYYY-MM" },
      { status: 400 },
    );
  }

  const { year, month } = parsed;

  try {
    const result = await loadLeaderboard(year, month, limitResult.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export const loadLeaderboard = async (
  year: number,
  month: number,
  limit: number,
) => {
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 1));

  // Get list leaderboard
  const leaderboard = await db.miniApp.groupBy({
    by: ["authorId"],
    where: {
      status: "APPROVED",
      createdAt: { gte: startOfMonth, lt: endOfMonth },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });
  // Get leaderboard users
  const authorIds = leaderboard.map((entry) => entry.authorId);
  const users = await db.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, image: true },
  });

  // Map result
  const userMap = new Map(users.map((u) => [u.id, u]));
  const result = leaderboard.map((entry, index) => ({
    rank: index + 1,
    count: entry._count.id,
    user: userMap.get(entry.authorId) ?? null,
  }));

  return result;
};
