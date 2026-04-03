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
      <div className="relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">Admin — Module Review</h1>
        <p className="text-slate-300">Quản lý và duyệt các module submissions từ developer</p>
      </div>

      {/* Pending Section */}
      <section className="relative z-10 space-y-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ⏳ Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
            <p className="text-slate-300 font-medium">No pending submissions. 🎉</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((module) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Reviewed Section */}
      <section className="relative z-10 space-y-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ✅ Recently Reviewed
        </h2>
        <div className="space-y-2">
          {recentlyReviewed.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-3 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition"
            >
              <span className="text-sm font-medium text-slate-100">{module.name}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  module.status === "APPROVED"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
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
