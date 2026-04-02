import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/modules/[id]/revisions — author or admin can inspect revision history
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const miniApp = await db.miniApp.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!miniApp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!session.user.isAdmin && miniApp.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const revisions = await db.moduleRevision.findMany({
    where: { moduleId: miniApp.id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: revisions });
}
