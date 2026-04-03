import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const comments = await db.comment.findMany({
    where: { moduleId: id, parentId: null },
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

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const module = await db.miniApp.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true, name: true, authorId: true },
  });

  if (!module || module.status !== "APPROVED") {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  let parentAuthorId: string | undefined;
  if (parsed.data.parentId) {
    const parentComment = await db.comment.findUnique({
      where: { id: parsed.data.parentId },
      select: { id: true, moduleId: true, authorId: true },
    });

    if (!parentComment || parentComment.moduleId !== module.id) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }

    parentAuthorId = parentComment.authorId;
  }

  const comment = await db.comment.create({
    data: {
      body: parsed.data.body,
      parentId: parsed.data.parentId,
      moduleId: module.id,
      authorId: session.user.id,
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
  });

  const notifyUserId = parsed.data.parentId ? parentAuthorId : module.authorId;

  if (notifyUserId && notifyUserId !== session.user.id) {
    await db.notification.create({
      data: {
        userId: notifyUserId,
        title: parsed.data.parentId ? "New reply to your comment" : "New comment on your module",
        message: parsed.data.parentId
          ? `${session.user.name ?? "A user"} replied to your comment on "${module.name}".`
          : `${session.user.name ?? "A user"} commented on "${module.name}".`,
        link: `/modules/${module.slug}`,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
