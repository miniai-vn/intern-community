import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateTodoSchema = z.object({
  title: z.string().optional(),
  isComplete: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updates = updateTodoSchema.parse(body);

    const todo = await db.todo.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!todo) {
      return Response.json({ error: "Todo not found" }, { status: 404 });
    }

    if (todo.author.email !== session.user.email) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.todo.update({
      where: { id },
      data: updates,
    });

    return Response.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return Response.json(
        { error: firstError?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Failed to update todo:", error);
    return Response.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const todo = await db.todo.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!todo) {
      return Response.json({ error: "Todo not found" }, { status: 404 });
    }

    if (todo.author.email !== session.user.email) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.todo.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return Response.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
