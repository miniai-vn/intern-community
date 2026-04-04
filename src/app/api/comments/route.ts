import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";

// GET /api/comments?moduleId=xxx - Get all comments for a module
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");

  if (!moduleId) {
    return NextResponse.json(
      { error: "moduleId is required" },
      { status: 400 }
    );
  }

  // Verify module exists and is approved
  const module = await db.miniApp.findUnique({
    where: { id: moduleId, status: "APPROVED" },
    select: { id: true },
  });

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  // Fetch root comments (parentId = null) with their replies
  const comments = await db.comment.findMany({
    where: {
      moduleId,
      parentId: null, // Only root comments
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

// POST /api/comments - Create a new comment
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { content, moduleId, parentId } = parsed.data;

  // Verify module exists and is approved
  const module = await db.miniApp.findUnique({
    where: { id: moduleId, status: "APPROVED" },
    select: { id: true },
  });

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  // If replying, verify parent comment exists and belongs to same module
  if (parentId) {
    const parentComment = await db.comment.findUnique({
      where: { id: parentId },
      select: { moduleId: true, parentId: true },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 }
      );
    }

    if (parentComment.moduleId !== moduleId) {
      return NextResponse.json(
        { error: "Parent comment belongs to different module" },
        { status: 400 }
      );
    }

    // Only allow single-level replies (no nested replies)
    if (parentComment.parentId !== null) {
      return NextResponse.json(
        { error: "Cannot reply to a reply" },
        { status: 400 }
      );
    }
  }

  const comment = await db.comment.create({
    data: {
      content,
      moduleId,
      parentId,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
