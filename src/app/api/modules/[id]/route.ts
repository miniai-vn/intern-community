import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminReviewSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/modules/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const miniApp = await db.miniApp.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
  });
  if (!miniApp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(miniApp);
}

// PATCH /api/modules/[id] — admin approve/reject
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = adminReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await db.miniApp.update({
    where: { id },
    data: {
      status: parsed.data.status,
      feedback: parsed.data.feedback,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/modules/[id] — author or admin can delete their own submission
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const miniApp = await db.miniApp.findUnique({ where: { id } });
  if (!miniApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (miniApp.authorId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.miniApp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
