import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Review community modules and manage feedback.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-semibold text-gray-900">{pending.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2">
            <p className="text-xs text-gray-500">Reviewed</p>
            <p className="text-lg font-semibold text-gray-900">{recentlyReviewed.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Pending Queue</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {pending.length} items
            </span>
          </div>

          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-sm text-gray-500">No pending submissions. 🎉</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {pending.map((module) => (
                  <AdminReviewCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recently Reviewed</h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {recentlyReviewed.length === 0 ? (
              <p className="text-sm text-gray-400">No reviewed modules yet.</p>
            ) : (
              <div className="space-y-2">
                {recentlyReviewed.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-800 truncate pr-3">
                      {module.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${module.status === "APPROVED"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                        }`}
                    >
                      {module.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">Tip</h3>
            <p className="mt-1 text-sm text-gray-600">
              Approve modules only when the repo + demo work as expected. Use the feedback box to guide the author.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
