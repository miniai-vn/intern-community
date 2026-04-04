import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitModuleSchema } from "@/lib/validations";
import { generateSlug, makeUniqueSlug } from "@/lib/utils";

const MAX_BODY_BYTES = 65_536;
const MAX_SEARCH_QUERY_LEN = 200;

// GET /api/modules — list approved modules (with optional category filter + search)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const rawSearch = searchParams.get("q");
  const search =
    rawSearch && rawSearch.length > MAX_SEARCH_QUERY_LEN
      ? rawSearch.slice(0, MAX_SEARCH_QUERY_LEN)
      : rawSearch;
  const cursor = searchParams.get("cursor");
  const limit = 12;

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

  return NextResponse.json({ items, nextCursor });
}

// POST /api/modules — submit a new module (authenticated)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !checkRateLimit(`submit:${session.user.id}`, {
      max: 10,
      windowMs: 3_600_000,
    })
  ) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength !== null) {
    const n = Number.parseInt(contentLength, 10);
    if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
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
    .then((rows) => rows.map((row) => row.slug));
  const slug = makeUniqueSlug(baseSlug, existingSlugs);

  const created = await db.miniApp.create({
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

  return NextResponse.json(created, { status: 201 });
}
