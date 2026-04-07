import { Suspense } from "react";
import { TodoForm } from "@/components/todo-form";
import { TodoList } from "@/components/todo-list";

export const metadata = {
  title: "My Tasks | Intern Community",
  description: "Manage your daily tasks",
};

function LoadingSkeletons() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2].map((col) => (
        <div key={col} className="space-y-3">
          <div className="h-6 w-32 animate-pulse rounded bg-neutral-200"></div>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-lg bg-neutral-200"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TodosPage() {
  return (
    <main className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900">My Tasks</h1>
          <p className="mt-2 text-neutral-600">
            Stay organized and track your progress.
          </p>
        </div>

        {/* Form */}
        <div className="mb-8">
          <TodoForm />
        </div>

        {/* Statistics */}
        <div className="mb-8 flex gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>Done</span>
          </div>
        </div>

        {/* List */}
        <Suspense fallback={<LoadingSkeletons />}>
          <TodoList />
        </Suspense>
      </div>
    </main>
  );
}
