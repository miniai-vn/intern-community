import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { editCommentSchema } from "@/lib/validations";
import { checkAndModerateComment } from "@/lib/moderation";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/comments/:id — edit own comment
export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const comment = await db.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Only the author can edit
  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = editCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const updated = await db.comment.update({
    where: { id },
    data: { text: parsed.data.text, moderationStatus: "PENDING", moderationError: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  // Schedule background moderation after response is sent
  after(async () => {
    await checkAndModerateComment(updated.id, updated.text, session.user.id);
  });

  return NextResponse.json(updated);
}

// DELETE /api/comments/:id — delete comment (own or admin)
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const comment = await db.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Only the author or an admin can delete
  if (comment.authorId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.comment.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
