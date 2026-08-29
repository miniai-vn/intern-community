import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";

const PAGE_SIZE = 10;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const skip = (pageNumber - 1) * PAGE_SIZE;

  const pendingTotal = await db.miniApp.count({
    where: { status: "PENDING" },
  });

  const pending = await db.miniApp.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    skip,
    take: PAGE_SIZE,
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

  const totalPages = Math.max(1, Math.ceil(pendingTotal / PAGE_SIZE));
  const hasPrev = pageNumber > 1;
  const hasNext = pageNumber < totalPages;
  const isOutOfRange = pendingTotal > 0 && pending.length === 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin — Module Review</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Pending ({pendingTotal})
        </h2>
        {pendingTotal === 0 ? (
          <p className="text-sm text-gray-400">No pending submissions. 🎉</p>
        ) : isOutOfRange ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              No submissions on this page. Try going back to a previous page.
            </p>
            <Link
              href={`/admin?page=${totalPages}`}
              className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Go to last page
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map((module) => (
                <AdminReviewCard key={module.id} module={module} />
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                {hasPrev ? (
                  <Link
                    href={`/admin?page=${pageNumber - 1}`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Prev
                  </Link>
                ) : (
                  <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
                    Prev
                  </span>
                )}

                {hasNext ? (
                  <Link
                    href={`/admin?page=${pageNumber + 1}`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
                    Next
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Recently Reviewed</h2>
        <div className="space-y-2">
          {recentlyReviewed.map((module) => (
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
