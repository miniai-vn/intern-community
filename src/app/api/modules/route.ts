import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitModuleSchema } from "@/lib/validations";
import { generateSlug, makeUniqueSlug } from "@/lib/utils";

// GET /api/modules — list approved modules (with optional category filter + search)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const cursor = searchParams.get("cursor");
  const limit = 12;

  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    // NOTE: Always include category and author to avoid N+1 on listing pages.
    // DO NOT remove the include without running EXPLAIN ANALYZE on the query.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = modules.length > limit;
  const items = hasMore ? modules.slice(0, limit) : modules;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  // Attach hasVoted to each item for authenticated callers (avoids a second round-trip).
  let votedSet = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: items.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedSet = new Set(votes.map((v) => v.moduleId));
  }

  const itemsWithVoted = items.map((m) => ({
    ...m,
    hasVoted: votedSet.has(m.id),
  }));

  return NextResponse.json({ items: itemsWithVoted, nextCursor });
}

// POST /api/modules — submit a new module (authenticated)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = submitModuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, description, categoryId, repoUrl, demoUrl } = parsed.data;

  const baseSlug = generateSlug(name);
  const existingSlugs = await db.miniApp
    .findMany({ where: { slug: { startsWith: baseSlug } }, select: { slug: true } })
    .then((r) => r.map((m) => m.slug));
  const slug = makeUniqueSlug(baseSlug, existingSlugs);

  const newModule = await db.miniApp.create({
    data: {
      slug,
      name,
      description,
      categoryId,
      repoUrl,
      demoUrl,
      authorId: session.user.id,
      status: "PENDING",
    },
  });

  return NextResponse.json(newModule, { status: 201 });
}
