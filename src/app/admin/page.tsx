import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const pageSize = 10;
  const currentPage = Math.max(page, 1);

  const totalPending = await db.miniApp.count({
    where: { status: "PENDING" },
  });

  const pending = await db.miniApp.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
  });

  const hasNext = currentPage * pageSize < totalPending;
  const hasPrev = currentPage > 1;

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
      <h1 className="text-2xl font-bold text-foreground">
        Admin — Module Review
      </h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Pending ({totalPending})
        </h2>

        {pending.length === 0 ? (
          totalPending === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending submissions.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No submissions on this page.
            </p>
          )
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map((module) => (
                <AdminReviewCard key={module.id} module={module} />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href={`/admin?page=${currentPage - 1}`}
                className={`text-sm ${
                  hasPrev
                    ? "text-blue-600 hover:underline"
                    : "pointer-events-none text-muted-foreground"
                }`}
              >
                ← Prev
              </Link>

              <span className="text-sm text-muted-foreground">
                Page {currentPage}
              </span>

              <Link
                href={`/admin?page=${currentPage + 1}`}
                className={`text-sm ${
                  hasNext
                    ? "text-blue-600 hover:underline"
                    : "pointer-events-none text-muted-foreground"
                }`}
              >
                Next →
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Recently Reviewed
        </h2>

        <div className="space-y-2">
          {recentlyReviewed.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <span className="text-sm font-medium text-foreground">
                {module.name}
              </span>
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
