import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_HISTORY_PER_USER = 20;

// GET /api/search-history — return recent search queries for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await db.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_PER_USER,
    select: { id: true, query: true, createdAt: true },
  });

  return NextResponse.json(history);
}

// DELETE /api/search-history — clear all search history for the logged-in user
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.searchHistory.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

// POST /api/search-history — save a search query for the logged-in user
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query =
    body && typeof body === "object" && "query" in body
      ? (body as Record<string, unknown>).query
      : undefined;

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "query is required and must be a string" },
      { status: 400 },
    );
  }

  const trimmed = query.trim();
  if (trimmed.length === 0 || trimmed.length > 200) {
    return NextResponse.json(
      { error: "query must be between 1 and 200 characters" },
      { status: 400 },
    );
  }

  // Upsert: if the same query already exists for this user, update its timestamp
  // so it appears as the most recent. Otherwise create a new entry.
  const existing = await db.searchHistory.findFirst({
    where: { userId: session.user.id, query: trimmed },
  });

  if (existing) {
    await db.searchHistory.update({
      where: { id: existing.id },
      data: { createdAt: new Date() },
    });
  } else {
    await db.searchHistory.create({
      data: { userId: session.user.id, query: trimmed },
    });

    // Enforce the per-user limit: keep only the 20 most recent
    const all = await db.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (all.length > MAX_HISTORY_PER_USER) {
      const idsToDelete = all.slice(MAX_HISTORY_PER_USER).map((h) => h.id);
      await db.searchHistory.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
