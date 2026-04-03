import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitModuleSchema } from "@/lib/validations";
import { generateSlug, makeUniqueSlug } from "@/lib/utils";

function buildSearchFilter(search?: string) {
  if (!search || search.trim().length === 0) return undefined;
  const terms = search
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return undefined;

  return {
    AND: terms.map((term) => ({
      OR: [
        { name: { startsWith: term, mode: "insensitive" } },
        { name: { contains: term, mode: "insensitive" } },
        { description: { startsWith: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ],
    })),
  };
}

// GET /api/modules — list approved modules (with optional category filter + search)
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const cursor = searchParams.get("cursor");
  const limit = 12;
  const normalizedCategory =
    typeof category === "string" && category.trim().length > 0
      ? category.trim()
      : undefined;
  const normalizedSearch =
    typeof search === "string" && search.trim().length > 0
      ? search.trim()
      : undefined;

  let categoryId = undefined;
  if (normalizedCategory) {
    const categoryRecord = await db.category.findUnique({
      where: { slug: normalizedCategory },
      select: { id: true },
    });
    categoryId = categoryRecord?.id;
  }

  const searchFilter = buildSearchFilter(normalizedSearch);

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(categoryId ? { categoryId } : {}),
      ...(searchFilter ? searchFilter : {}),
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

  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.Vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: items.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const itemsWithVoteState = items.map((m) => ({
    ...m,
    hasVoted: votedIds.has(m.id),
  }));

  return NextResponse.json({ items: itemsWithVoteState, nextCursor });
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

  const moduleRecord = await db.miniApp.create({
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

  return NextResponse.json(moduleRecord, { status: 201 });
}
