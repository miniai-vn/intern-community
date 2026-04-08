import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const pending = await db.miniApp.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const recentlyReviewed = await db.miniApp.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin — Module Review</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No pending submissions. 🎉</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((module: typeof pending[number]) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Recently Reviewed
        </h2>
        <div className="space-y-2">
          {recentlyReviewed.map((module: typeof recentlyReviewed[number]) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-white">{module.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  module.status === "APPROVED"
                    ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {module.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
