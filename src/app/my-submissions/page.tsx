import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteSubmissionButton } from "@/components/delete-submission-button";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
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
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Submissions</h1>
          <p className="text-sm text-muted-foreground">Manage and track your contributed modules</p>
        </div>
        <Link
          href="/submit"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-md"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground">No submissions yet.</p>
          <p className="text-sm text-muted-foreground mb-6">Start contributing to the community today!</p>
          <Link
            href="/submit"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="space-y-1.5">
                <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {sub.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-primary/80 lowercase bg-primary/5 px-2 py-0.5 rounded-full">
                    {sub.category.name}
                  </span>
                  <span>•</span>
                  <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                </div>
                {sub.feedback && (
                  <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed border border-border/50">
                    <span className="font-bold text-foreground block mb-1">Feedback from reviewers:</span>
                    <p className="text-muted-foreground">{sub.feedback}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    statusStyles[sub.status]
                  }`}
                >
                  {sub.status}
                </span>
                {sub.status === "PENDING" && (
                  <DeleteSubmissionButton id={sub.id} name={sub.name} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
