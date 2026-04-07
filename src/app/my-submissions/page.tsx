import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const statusStyles: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  APPROVED: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  REJECTED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
};

export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const submissions = await db.miniApp.findMany({
    where: { authorId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My <span className="text-accent">Submissions</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{submissions.length} module{submissions.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <Link
          href="/submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover"
        >
          + New Module
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="text-muted">No submissions yet.</p>
          <Link
            href="/submit"
            className="mt-3 block text-sm font-medium text-accent hover:underline"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/30"
            >
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{sub.name}</p>
                <p className="text-xs text-muted">
                  {sub.category.name} · {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.feedback && (
                  <p className="mt-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted">
                    <span className="font-medium text-foreground">Feedback:</span> {sub.feedback}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[sub.status]}`}
              >
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
