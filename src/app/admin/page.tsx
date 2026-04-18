import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";

const PENDING_PAGE_SIZE = 8;
const REVIEWED_PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ pendingPage?: string; reviewedPage?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const { pendingPage: pendingPageParam, reviewedPage: reviewedPageParam } =
    await searchParams;

  const pendingPage = Math.max(1, Number(pendingPageParam ?? "1") || 1);
  const reviewedPage = Math.max(1, Number(reviewedPageParam ?? "1") || 1);

  // ─── Pending ───────────────────────────────────────────────────────────────
  const [pendingTotal, pendingItems] = await Promise.all([
    db.miniApp.count({ where: { status: "PENDING" } }),
    db.miniApp.findMany({
      where: { status: "PENDING" },
      include: {
        category: true,
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
      take: PENDING_PAGE_SIZE,
      skip: (pendingPage - 1) * PENDING_PAGE_SIZE,
    }),
  ]);

  const pendingTotalPages = Math.max(1, Math.ceil(pendingTotal / PENDING_PAGE_SIZE));

  // ─── Recently Reviewed ─────────────────────────────────────────────────────
  const [reviewedTotal, recentlyReviewed] = await Promise.all([
    db.miniApp.count({ where: { status: { in: ["APPROVED", "REJECTED"] } } }),
    db.miniApp.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: {
        category: true,
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: REVIEWED_PAGE_SIZE,
      skip: (reviewedPage - 1) * REVIEWED_PAGE_SIZE,
    }),
  ]);

  const reviewedTotalPages = Math.max(1, Math.ceil(reviewedTotal / REVIEWED_PAGE_SIZE));

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Admin — Module Review</h1>

      {/* ── Pending section ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            Pending
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-sm font-medium text-yellow-800">
              {pendingTotal}
            </span>
          </h2>
          {pendingTotalPages > 1 && (
            <Pagination
              current={pendingPage}
              total={pendingTotalPages}
              paramKey="pendingPage"
              otherParams={{ reviewedPage: String(reviewedPage) }}
            />
          )}
        </div>

        {pendingItems.length === 0 ? (
          <p className="text-sm text-gray-400">No pending submissions. 🎉</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {pendingItems.map((module) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}

        {pendingTotalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              current={pendingPage}
              total={pendingTotalPages}
              paramKey="pendingPage"
              otherParams={{ reviewedPage: String(reviewedPage) }}
            />
          </div>
        )}
      </section>

      {/* ── Recently Reviewed section ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            Recently Reviewed
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-600">
              {reviewedTotal}
            </span>
          </h2>
          {reviewedTotalPages > 1 && (
            <Pagination
              current={reviewedPage}
              total={reviewedTotalPages}
              paramKey="reviewedPage"
              otherParams={{ pendingPage: String(pendingPage) }}
            />
          )}
        </div>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {recentlyReviewed.map((module) => (
            <div
              key={module.id}
              className="flex items-center gap-4 px-5 py-3"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  module.status === "APPROVED"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {module.status}
              </span>
              <div className="flex flex-1 items-center gap-6 overflow-hidden">
                <span className="truncate text-sm font-medium text-gray-900">
                  {module.name}
                </span>
                <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
                  {module.author.name}
                </span>
                <span className="hidden shrink-0 text-xs text-gray-400 md:block">
                  {module.category.name}
                </span>
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {new Date(module.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>

        {reviewedTotalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              current={reviewedPage}
              total={reviewedTotalPages}
              paramKey="reviewedPage"
              otherParams={{ pendingPage: String(pendingPage) }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Shared Pagination component ───────────────────────────────────────────
// Renders as plain <a> links — works without JS, consistent with how category
// filters and search already work in page.tsx.

function buildUrl(
  paramKey: string,
  page: number,
  otherParams: Record<string, string>
) {
  const params = new URLSearchParams({ ...otherParams, [paramKey]: String(page) });
  return `/admin?${params.toString()}`;
}

function Pagination({
  current,
  total,
  paramKey,
  otherParams,
}: {
  current: number;
  total: number;
  paramKey: string;
  otherParams: Record<string, string>;
}) {
  const delta = 2;
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const linkClass =
    "rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50";
  const disabledClass =
    "rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-300 cursor-not-allowed select-none";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      {current > 1 ? (
        <a href={buildUrl(paramKey, current - 1, otherParams)} className={linkClass}>
          ← Prev
        </a>
      ) : (
        <span className={disabledClass}>← Prev</span>
      )}

      {start > 1 && (
        <>
          <a href={buildUrl(paramKey, 1, otherParams)} className={linkClass}>1</a>
          {start > 2 && <span className="px-1 text-xs text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) =>
        p === current ? (
          <span
            key={p}
            aria-current="page"
            className="rounded-md border border-blue-500 bg-blue-600 px-2.5 py-1 text-xs font-medium text-white"
          >
            {p}
          </span>
        ) : (
          <a key={p} href={buildUrl(paramKey, p, otherParams)} className={linkClass}>
            {p}
          </a>
        )
      )}

      {end < total && (
        <>
          {end < total - 1 && <span className="px-1 text-xs text-gray-400">…</span>}
          <a href={buildUrl(paramKey, total, otherParams)} className={linkClass}>{total}</a>
        </>
      )}

      {current < total ? (
        <a href={buildUrl(paramKey, current + 1, otherParams)} className={linkClass}>
          Next →
        </a>
      ) : (
        <span className={disabledClass}>Next →</span>
      )}
    </nav>
  );
}