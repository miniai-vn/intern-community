import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminReviewSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// GET /api/modules/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const appDetails = await db.miniApp.findUnique({
  where: { id },
  include: {
    category: true,
    author: { select: { id: true, name: true, image: true } },
    _count: { select: { votes: true } },
  },
});
  if (!appDetails) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(appDetails);
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

  // Fetch the module before updating so we know the author and current status.
  // We only create a notification when the status actually changes to avoid
  // duplicate notifications if an admin re-saves the same decision.
  const existing = await db.miniApp.findUnique({
    where: { id },
    select: { authorId: true, name: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.miniApp.update({
    where: { id },
    data: {
      status: parsed.data.status,
      feedback: parsed.data.feedback,
    },
  });

  // Create a notification only when the status transitions to APPROVED or REJECTED
  // and the new status is different from the old one. This prevents duplicate
  // notifications if a maintainer re-approves an already-approved submission.
  const isTerminalStatus =
    parsed.data.status === "APPROVED" || parsed.data.status === "REJECTED";
  const statusChanged = existing.status !== parsed.data.status;

  if (isTerminalStatus && statusChanged) {
    const verb = parsed.data.status === "APPROVED" ? "approved" : "rejected";
    await db.notification.create({
      data: {
        userId: existing.authorId,
        miniAppId: id,
        type:
          parsed.data.status === "APPROVED"
            ? "SUBMISSION_APPROVED"
            : "SUBMISSION_REJECTED",
        // Message is stored verbatim at creation time. If the module is later
        // renamed the historical notification still makes sense.
        message: `"${existing.name}" was ${verb}`,
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
  const miniApp = await db.miniApp.findUnique({ where: { id } });
  if (!miniApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (miniApp.authorId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.miniApp.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
