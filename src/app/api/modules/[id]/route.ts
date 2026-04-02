import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminReviewSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

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

  // Get the module before update to know author and name
  const existingModule = await db.miniApp.findUnique({
    where: { id },
    select: { authorId: true, name: true, status: true },
  });

  if (!existingModule) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  // Only create notification if status actually changed
  const statusChanged = existingModule.status !== parsed.data.status;
  const isApprovedOrRejected = parsed.data.status === "APPROVED" || parsed.data.status === "REJECTED";

  // Update module
  const updated = await db.miniApp.update({
    where: { id },
    data: {
      status: parsed.data.status,
      feedback: parsed.data.feedback,
    },
  });

  // Create notification if status changed to APPROVED or REJECTED
  if (statusChanged && isApprovedOrRejected) {
    const notificationType = parsed.data.status === "APPROVED" ? "APPROVED" : "REJECTED";
    const message = `"${existingModule.name}" was ${notificationType.toLowerCase()}`;

    await db.notification.create({
      data: {
        userId: existingModule.authorId,
        moduleId: id,
        title: notificationType === "APPROVED" ? "Module Approved" : "Module Rejected",
        message,
        type: notificationType,
      },
    });
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

  await db.miniApp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
