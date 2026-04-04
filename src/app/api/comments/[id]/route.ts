import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateCommentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/comments/[id] - Update a comment
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await db.comment.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Only the author can edit their own comment
  if (comment.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only edit your own comments" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updated = await db.comment.update({
    where: { id },
    data: { content: parsed.data.content },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await db.comment.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Author can delete their own comments, admin can delete any
  const isOwner = comment.authorId === session.user.id;
  const isAdmin = session.user.isAdmin;

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "You can only delete your own comments" },
      { status: 403 }
    );
  }

  await db.comment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
