import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const statusStyles: Record<string, string> = {
  PENDING: "badge-secondary bg-amber-100 text-amber-800",
  APPROVED: "badge-success",
  REJECTED: "bg-red-100 text-red-700",
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
        <h1 className="text-2xl font-bold text-foreground">My Submissions</h1>
        <Link
          href="/submit"
          className="btn-primary text-sm px-3 py-2"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="card-bg p-12 text-center border-dashed">
          <p className="text-muted-foreground">No submissions yet.</p>
          <Link
            href="/submit"
            className="mt-2 block text-sm text-[var(--primary)] hover:underline"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="card-elevated p-4 flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-foreground">{sub.name}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.category.name} ·{" "}
                  {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.feedback && (
                  <p className="mt-1 rounded-md bg-[var(--muted-background)] px-2 py-1 text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
                    Feedback: {sub.feedback}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                  statusStyles[sub.status]
                }`}
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
