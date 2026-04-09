import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitModuleSchema } from "@/lib/validations";
import { generateSlug, makeUniqueSlug } from "@/lib/utils";
import { getModules } from "@/lib/module-query";
// GET /api/modules — list approved modules (with optional category filter + search)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const cursor = searchParams.get("cursor") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  // 👉 dùng shared query
  const { modules, nextCursor } = await getModules({
    cursor,
    q,
    category,
  });

  return NextResponse.json({ modules, nextCursor });
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