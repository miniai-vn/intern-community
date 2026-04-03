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
      <section className="section-shell rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-50">
              Admin desk
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
                Module review queue
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-stone-600">
                Review new submissions, leave clear feedback, and keep the public
                catalogue focused on modules worth shipping.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-stone-200 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Pending now
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-950">{pending.length}</p>
            </div>
            <div className="rounded-[1.4rem] border border-stone-200 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Recently reviewed
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-950">
                {recentlyReviewed.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-700">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="section-shell rounded-[1.8rem] border-dashed p-12 text-center">
            <p className="text-lg font-medium text-stone-800">No pending submissions.</p>
            <p className="mt-2 text-sm text-stone-500">
              The queue is clear for now. New items will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {pending.map((module) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-700">Recently reviewed</h2>
        {recentlyReviewed.length === 0 ? (
          <div className="section-shell rounded-[1.8rem] border-dashed p-10 text-center text-sm text-stone-500">
            Review history will appear here once you approve or reject a submission.
          </div>
        ) : (
          <div className="grid gap-3">
            {recentlyReviewed.map((module) => (
              <div
                key={module.id}
                className="glass-panel flex flex-col gap-4 rounded-[1.4rem] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900">{module.name}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    by {module.author.name ?? "Unknown contributor"} · {module.category.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
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
        )}
      </section>
    </div>
  );
}
