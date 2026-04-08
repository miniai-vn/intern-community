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
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-amber-100">Review and manage module submissions</p>
      </div>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
            {pending.length}
          </span>
          Pending Review
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="text-4xl">🎉</div>
            <p className="mt-3 font-medium text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-500">No pending submissions to review</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((module) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <span className="text-sm font-normal text-gray-500">Recently reviewed</span>
        </h2>
        <div className="space-y-2">
          {recentlyReviewed.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <span className="font-medium text-gray-800">{module.name}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  module.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
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
