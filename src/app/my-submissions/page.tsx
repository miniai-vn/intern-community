import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import DeleteButton from "@/components/ui/delete-button";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
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
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <Link
          href="/submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mb-4 size-10 text-gray-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">No submissions</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new module.</p>
          <div className="mt-6">
            <Link
              href="/submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              + New Submission
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="space-y-1">
                {sub.status === "APPROVED" ? (
                  <Link
                    href={`/modules/${sub.slug}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {sub.name}
                  </Link>
                ) : (
                  <p className="font-medium text-gray-900">{sub.name}</p>
                )}
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
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[sub.status]
                    }`}
                >
                  {sub.status}
                </span>
                {(sub.status === "PENDING") && <DeleteButton moduleId={sub.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
