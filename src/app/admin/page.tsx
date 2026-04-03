import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";

const ITEMS_PER_PAGE = 12;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count for pagination calculation
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
    skip,
    take: ITEMS_PER_PAGE,
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
      <h1 className="text-2xl font-bold text-gray-900">Admin — Module Review</h1>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            Pending ({totalPending})
          </h2>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {Math.ceil(totalPending / ITEMS_PER_PAGE)}
          </span>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending submissions. 🎉</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map((module) => (
                <AdminReviewCard key={module.id} module={module} />
              ))}
            </div>

            {/* Simple Pagination Controls */}
            <div className="flex items-center justify-center gap-4 pt-4">
              {currentPage > 1 && (
                <a
                  href={`/admin?page=${currentPage - 1}`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  ← Previous Page
                </a>
              )}

              {currentPage < Math.ceil(totalPending / ITEMS_PER_PAGE) && (
                <a
                  href={`/admin?page=${currentPage + 1}`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Next Page →
                </a>
              )}
            </div>
          </>
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
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${module.status === "APPROVED"
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
