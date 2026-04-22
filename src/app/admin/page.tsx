import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminDashboardTabs } from "@/components/admin-dashboard-tabs";

const PAGE_SIZE = 10;

function parsePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    pendingPage?: string;
    historyPage?: string;
    modulesPage?: string;
    accountsPage?: string;
    q?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const {
    tab,
    pendingPage: pendingPageParam,
    historyPage: historyPageParam,
    modulesPage: modulesPageParam,
    accountsPage: accountsPageParam,
    q,
  } = await searchParams;

  const activeTab: "pending" | "history" | "modules" | "accounts" =
    tab === "history" || tab === "modules" || tab === "accounts"
      ? tab
      : "pending";

  const keyword = q?.trim() ?? "";

  const moduleSearchWhere = keyword
    ? {
        name: {
          contains: keyword,
          mode: "insensitive" as const,
        },
      }
    : {};

  const accountSearchWhere = keyword
    ? {
        OR: [
          {
            name: {
              contains: keyword,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: keyword,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const managedModuleWhere = {
    status: "APPROVED" as const,
    ...moduleSearchWhere,
  };

  const pendingTotalCount = await db.miniApp.count({
    where: { status: "PENDING", ...moduleSearchWhere },
  });
  const historyTotalCount = await db.miniApp.count({
    where: {
      status: { in: ["APPROVED", "REJECTED"] },
      ...moduleSearchWhere,
    },
  });
  const modulesTotalCount = await db.miniApp.count({
    where: managedModuleWhere,
  });
  const accountsTotalCount = await db.user.count({
    where: accountSearchWhere,
  });

  const pendingTotalPages = Math.max(
    1,
    Math.ceil(pendingTotalCount / PAGE_SIZE),
  );
  const historyTotalPages = Math.max(
    1,
    Math.ceil(historyTotalCount / PAGE_SIZE),
  );
  const modulesTotalPages = Math.max(
    1,
    Math.ceil(modulesTotalCount / PAGE_SIZE),
  );
  const accountsTotalPages = Math.max(
    1,
    Math.ceil(accountsTotalCount / PAGE_SIZE),
  );

  const pendingPage = Math.min(parsePage(pendingPageParam), pendingTotalPages);
  const historyPage = Math.min(parsePage(historyPageParam), historyTotalPages);
  const modulesPage = Math.min(parsePage(modulesPageParam), modulesTotalPages);
  const accountsPage = Math.min(
    parsePage(accountsPageParam),
    accountsTotalPages,
  );

  const pending = await db.miniApp.findMany({
    where: { status: "PENDING", ...moduleSearchWhere },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    skip: (pendingPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const recentlyReviewed = await db.miniApp.findMany({
    where: {
      status: { in: ["APPROVED", "REJECTED"] },
      ...moduleSearchWhere,
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: (historyPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const approvedCount = await db.miniApp.count({
    where: { status: "APPROVED" },
  });
  const rejectedCount = await db.miniApp.count({
    where: { status: "REJECTED" },
  });

  const managedModules = await db.miniApp.findMany({
    where: managedModuleWhere,
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (modulesPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const managedUsers = await db.user.findMany({
    where: accountSearchWhere,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      isLocked: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (accountsPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="mx-auto w-full max-w-360 space-y-8 px-2 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-300/15 bg-slate-900/70 p-6 shadow-[0_18px_50px_rgba(11,14,30,0.45)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Moderator Workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              Admin - Module Review
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Review incoming modules, provide actionable feedback, and curate
              quality contributions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs sm:min-w-72">
            <MetricCard
              label="Pending"
              value={pendingTotalCount}
              tone="text-amber-200"
            />
            <MetricCard
              label="Approved"
              value={approvedCount}
              tone="text-emerald-200"
            />
            <MetricCard
              label="Rejected"
              value={rejectedCount}
              tone="text-rose-200"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <AdminDashboardTabs
          pending={pending}
          history={recentlyReviewed}
          modules={managedModules}
          users={managedUsers}
          currentAdminId={session.user.id}
          activeTab={activeTab}
          query={keyword}
          pendingPage={pendingPage}
          pendingTotalPages={pendingTotalPages}
          pendingTotalCount={pendingTotalCount}
          historyPage={historyPage}
          historyTotalPages={historyTotalPages}
          historyTotalCount={historyTotalCount}
          modulesPage={modulesPage}
          modulesTotalPages={modulesTotalPages}
          modulesTotalCount={modulesTotalCount}
          accountsPage={accountsPage}
          accountsTotalPages={accountsTotalPages}
          accountsTotalCount={accountsTotalCount}
        />
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-indigo-300/15 bg-slate-950/70 p-3">
      <p className="text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
