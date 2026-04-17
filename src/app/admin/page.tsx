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

  const statusStyles: Record<string, string> = {
    APPROVED: "border border-success-border bg-success-bg text-success-text",
    REJECTED: "border border-error-border bg-error-bg text-error-text",
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
        Admin — Module Review
      </h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-secondary">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-text-tertiary">No pending submissions.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((module) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-secondary">Recently Reviewed</h2>
        <div className="space-y-2">
          {recentlyReviewed.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span className="text-sm font-medium text-text-primary">{module.name}</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[module.status]}`}>
                {module.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}