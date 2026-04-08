"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { commentSchema } from "@/lib/validations";

export async function postComment(data: { content: string; miniAppId: string; parentId?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to comment" };

  const validated = commentSchema.safeParse(data);
  if (!validated.success) return { error: validated.error.issues[0].message };

  try {
    await db.$transaction(async (tx) => {
      await tx.comment.create({
        data: {
          content: validated.data.content,
          authorId: session.user.id!,
          miniAppId: validated.data.miniAppId,
          parentId: validated.data.parentId,
        },
      });

      await tx.activity.create({
        data: {
          type: "COMMENT",
          userId: session.user.id!,
          targetId: validated.data.miniAppId,
          content: validated.data.content.substring(0, 50),
        },
      });
    });

    revalidatePath(`/modules/${data.miniAppId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to post comment" };
  }
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Comment not found" };

  if (comment.authorId !== session.user.id && !session.user.isAdmin) {
    return { error: "Permission denied" };
  }

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/modules/${comment.miniAppId}`);
  return { success: true };
}