import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteSubmissionButton } from "@/components/delete-submission-button";

const statusStyles: Record<string, { badge: string; label: string }> = {
  PENDING: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    label: "Pending review",
  },
  APPROVED: {
    badge: "bg-green-50 text-green-700 border-green-200",
    label: "Approved",
  },
  REJECTED: {
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Rejected",
  },
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
          <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-sm text-gray-500">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No submissions yet.</p>
          <Link
            href="/submit"
            className="mt-2 block text-sm text-blue-600 hover:underline"
          >
            Submit your first module →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const style = statusStyles[sub.status];
            return (
              <div
                key={sub.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="min-w-0 space-y-1">
                  {sub.status === "APPROVED" ? (
                    <Link
                      href={`/modules/${sub.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                    >
                      {sub.name}
                    </Link>
                  ) : (
                    <p className="font-medium text-gray-900">{sub.name}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {sub.category.name} · {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                  {sub.feedback && (
                    <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                      Feedback: {sub.feedback}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  {/* Only PENDING submissions can be deleted by the author */}
                  {sub.status === "PENDING" && (
                    <DeleteSubmissionButton id={sub.id} name={sub.name} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
