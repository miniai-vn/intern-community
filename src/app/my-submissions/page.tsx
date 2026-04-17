import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const statusStyles: Record<string, string> = {
  PENDING: "border border-warning-border bg-warning-bg text-warning-text",
  APPROVED: "border border-success-border bg-success-bg text-success-text",
  REJECTED: "border border-error-border bg-error-bg text-error-text",
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
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">
          My Submissions
        </h1>
        <Link
          href="/submit"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-black shadow-sm shadow-amber-500/20 transition-colors duration-150 hover:bg-amber-400"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-16 text-center">
          <p className="font-display text-lg text-text-secondary">No submissions yet</p>
          <Link
            href="/submit"
            className="mt-3 block text-sm text-amber-400 hover:underline"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start justify-between rounded-2xl border border-border bg-surface p-4 transition-colors duration-150 hover:border-border-strong"
            >
              <div className="space-y-1.5">
                <p className="font-display font-semibold text-text-primary">{sub.name}</p>
                <p className="text-xs text-text-tertiary">
                  {sub.category.name} · {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.feedback && (
                  <p className="mt-2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-text-secondary">
                    {sub.feedback}
                  </p>
                )}
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[sub.status]}`}>
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}