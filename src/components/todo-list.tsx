import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TodoItem } from "./todo-item";

export async function TodoList() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
        <p className="text-neutral-600">Please sign in to view your tasks.</p>
      </div>
    );
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

  const incompleteTodos = todos.filter((todo: typeof todos[number]) => !todo.isComplete);
  const completedTodos = todos.filter((todo: typeof todos[number]) => todo.isComplete);

  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
        <p className="text-lg text-neutral-600">No tasks yet</p>
        <p className="mt-1 text-sm text-neutral-500">Create your first task to get started! ✨</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Incomplete Tasks Column */}
      <div className="flex flex-col">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500"></div>
          <h3 className="font-semibold text-neutral-900">
            To Do ({incompleteTodos.length})
          </h3>
        </div>
        <div className="flex-1 space-y-2">
          {incompleteTodos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
              <p className="text-sm text-neutral-500">All caught up!</p>
            </div>
          ) : (
            incompleteTodos.map((todo: typeof todos[number]) => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                title={todo.title}
                isComplete={todo.isComplete}
                createdAt={todo.createdAt.toISOString()}
              />
            ))
          )}
        </div>
      </div>

      {/* Completed Tasks Column */}
      <div className="flex flex-col">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <h3 className="font-semibold text-neutral-900">
            Done ({completedTodos.length})
          </h3>
        </div>
        <div className="flex-1 space-y-2">
          {completedTodos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
              <p className="text-sm text-neutral-500">No completed tasks yet</p>
            </div>
          ) : (
            completedTodos.map((todo: typeof todos[number]) => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                title={todo.title}
                isComplete={todo.isComplete}
                createdAt={todo.createdAt.toISOString()}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
