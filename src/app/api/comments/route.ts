import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations";
import { checkAndModerateComment } from "@/lib/moderation";

// GET /api/comments?miniAppId=xxx — list comments for a module
export async function GET(req: NextRequest) {
  const miniAppId = req.nextUrl.searchParams.get("miniAppId");
  if (!miniAppId) {
    return NextResponse.json({ error: "miniAppId is required" }, { status: 400 });
  }

  const comments = await db.comment.findMany({
    where: { miniAppId, parentId: null },
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

// POST /api/comments — create a new comment
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { text, miniAppId, parentId } = parsed.data;

  // If replying, ensure parent exists and is a root comment (single-level nesting)
  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId } });
    if (!parent) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
    if (parent.parentId) {
      return NextResponse.json(
        { error: "Cannot reply to a reply (single-level nesting only)" },
        { status: 400 }
      );
    }
  }

  const comment = await db.comment.create({
    data: {
      text,
      miniAppId,
      authorId: session.user.id,
      parentId: parentId || null,
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

  // Schedule background moderation using Next.js after()
  // This ensures the task runs to completion even after response is sent
  after(async () => {
    await checkAndModerateComment(comment.id, comment.text, session.user.id);
  });

  return NextResponse.json(comment, { status: 201 });
}
