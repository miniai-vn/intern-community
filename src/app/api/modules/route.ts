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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "3");
  const session = await auth();

  const whereCondition: any = {
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
  };

  const totalCount = await db.miniApp.count({ where: whereCondition });

  const items = await db.miniApp.findMany({
    where: whereCondition,
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const totalPages = Math.ceil(totalCount / limit);

  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: items.map((m: any) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v: any) => v.moduleId));
  }

  const itemsWithVote = items.map((item: any) => ({
    ...item,
    hasVoted: votedIds.has(item.id),
  }));

  return NextResponse.json({ items: itemsWithVote, totalPages, currentPage: page });
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
    .then((r: any[]) => r.map((m: any) => m.slug));
  const slug = makeUniqueSlug(baseSlug, existingSlugs);

  const module = await db.miniApp.create({
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

  return NextResponse.json(module, { status: 201 });
}
