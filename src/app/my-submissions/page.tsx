import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MySubmissionRow } from "@/components/my-submission-row";

const PAGE_SIZE = 10;

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  APPROVED: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  REJECTED: "bg-rose-500/15 text-rose-200 border-rose-400/30",
};

export default async function MySubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { page: pageParam } = await searchParams;

  const totalSubmissions = await db.miniApp.count({
    where: { authorId: session.user.id },
  });
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / PAGE_SIZE));
  const page = Math.min(parsePage(pageParam), totalPages);
  const returnTo =
    page > 1 ? `/my-submissions?page=${page}` : "/my-submissions";

  const submissions = await db.miniApp.findMany({
    where: { authorId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const pendingCount = submissions.filter(
    (item) => item.status === "PENDING",
  ).length;
  const approvedCount = submissions.filter(
    (item) => item.status === "APPROVED",
  ).length;

  return (
    <div className="mx-auto w-full max-w-360 space-y-8 px-2 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-300/15 bg-slate-900/70 p-6 shadow-[0_18px_50px_rgba(11,14,30,0.45)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Creator Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              My Submissions
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Track moderation status, review feedback, and iterate quickly on
              your modules.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:min-w-56">
            <div className="rounded-xl border border-indigo-300/15 bg-slate-950/70 p-3">
              <p className="text-slate-400">Pending</p>
              <p className="mt-1 text-xl font-semibold text-amber-200">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-300/15 bg-slate-950/70 p-3">
              <p className="text-slate-400">Approved</p>
              <p className="mt-1 text-xl font-semibold text-emerald-200">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Link
          href="/submit"
          className="rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-indigo-300/20 bg-slate-900/60 p-12 text-center">
          <p className="text-slate-300">No submissions yet.</p>
          <Link
            href="/submit"
            className="mt-2 block text-sm text-violet-300 hover:underline"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {submissions.map((sub) => (
              <MySubmissionRow
                key={sub.id}
                module={sub}
                returnTo={returnTo}
                statusClassName={statusStyles[sub.status]}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="My submissions pagination"
              className="mt-4 flex items-center justify-between rounded-xl border border-indigo-300/15 bg-slate-900/60 px-4 py-3 text-sm"
            >
              <Link
                href={
                  page > 2
                    ? `/my-submissions?page=${page - 1}`
                    : "/my-submissions"
                }
                scroll={false}
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-500 opacity-40"
                    : "rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-200 transition hover:border-violet-300/35 hover:text-violet-200"
                }
              >
                {"<"}
              </Link>

              <p className="text-xs text-slate-400">
                Page {page} / {totalPages}
              </p>

              <Link
                href={
                  page + 1 > 1
                    ? `/my-submissions?page=${Math.min(totalPages, page + 1)}`
                    : "/my-submissions"
                }
                scroll={false}
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-500 opacity-40"
                    : "rounded-md border border-indigo-300/20 px-3 py-1.5 text-slate-200 transition hover:border-violet-300/35 hover:text-violet-200"
                }
              >
                {">"}
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
