import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminReviewSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/modules/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const module = await db.miniApp.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true } },
    },
  });
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(module);
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

  const existing = await db.miniApp.findUnique({
    where: { id },
    select: { id: true, name: true, authorId: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.$transaction(async (tx) => {
    const nextModule = await tx.miniApp.update({
      where: { id },
      data: {
        status: parsed.data.status,
        feedback: parsed.data.feedback,
      },
    });

    if (existing.status !== parsed.data.status) {
      const statusLabel =
        parsed.data.status === "APPROVED" ? "approved" : "rejected";

      await tx.notification.create({
        data: {
          userId: existing.authorId,
          title: `Submission ${statusLabel}`,
          message: `Your submission "${existing.name}" was ${statusLabel} by an admin.`,
          link: "/my-submissions",
        },
      });
    }

    return nextModule;
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
  const module = await db.miniApp.findUnique({ where: { id } });
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (module.authorId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!session.user.isAdmin && module.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only pending submissions can be deleted." },
      { status: 409 }
    );
  }

  await db.miniApp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
