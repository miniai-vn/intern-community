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
    <div className="w-3/5 max-lg:w-[95%]">
      <h1 className="text-2xl font-bold text-gray-900">Admin — Module Review</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending submissions. 🎉</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((module: any) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Recently Reviewed</h2>
        <div className="space-y-2">
          {recentlyReviewed.map((module: any) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <span className="text-sm font-medium text-gray-800">{module.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  module.status === "APPROVED"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
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
