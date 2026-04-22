import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminReviewSchema } from "@/lib/validations";
import { emitNotificationToUser } from "@/lib/notification-realtime";

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
    select: { id: true, name: true, slug: true, authorId: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { updated, notification } = await db.$transaction(async (tx) => {
    const updatedModule = await tx.miniApp.update({
      where: { id },
      data: {
        status: parsed.data.status,
        feedback: parsed.data.feedback,
      },
    });

    if (existing.status === parsed.data.status) {
      return { updated: updatedModule, notification: null };
    }

    const createdNotification = await tx.notification.create({
      data: {
        userId: existing.authorId,
        type:
          parsed.data.status === "APPROVED"
            ? "MODULE_APPROVED"
            : "MODULE_REJECTED",
        title:
          parsed.data.status === "APPROVED"
            ? "Module approved"
            : "Module rejected",
        message:
          parsed.data.status === "APPROVED"
            ? `${existing.name} has been approved.`
            : `${existing.name} has been rejected. Check feedback for details.`,
        link:
          parsed.data.status === "REJECTED"
            ? `/my-submissions/${existing.slug}`
            : "/my-submissions",
      },
    });

    return { updated: updatedModule, notification: createdNotification };
  });

  if (notification) {
    emitNotificationToUser(existing.authorId, notification);
  }

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

  const isAdminDeletingOtherUserModule =
    session.user.isAdmin && module.authorId !== session.user.id;

  if (isAdminDeletingOtherUserModule) {
    const updated = await db.miniApp.update({
      where: { id },
      data: {
        status: "REJECTED",
        isLocked: true,
        feedback:
          module.feedback?.trim() ||
          "This module was removed from listing by admin moderation.",
      },
    });

    return NextResponse.json(updated);
  }

  await db.miniApp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
