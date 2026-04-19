import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteSubmissionButton } from "@/components/delete-submission-button";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const submissions = await db.miniApp.findMany({
    where: { authorId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
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
          {submissions.map((sub: any) => (
            <div
              key={sub.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{sub.name}</p>
                <p className="text-xs text-gray-400">
                  {sub.category.name} ·{" "}
                  {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.feedback && (
                  <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    Feedback: {sub.feedback}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    statusStyles[sub.status]
                  }`}
                >
                  {sub.status}
                </span>
                {sub.status === "PENDING" && <DeleteSubmissionButton id={sub.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
