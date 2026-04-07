import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating a todo
const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todos = await db.todo.findMany({
      where: {
        author: {
          email: session.user.email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(todos);
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return Response.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title } = createTodoSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const todo = await db.todo.create({
      data: {
        title,
        authorId: user.id,
      },
    });

    return Response.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return Response.json(
        { error: firstError?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Failed to create todo:", error);
    return Response.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
