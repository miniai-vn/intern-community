import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteButton } from "@/components/deleteButton";

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
        <h1 className="text-3xl font-bold text-white">My Submissions</h1>
        <Link
          href="/submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="group relative rounded-2xl border border-dashed border-gray-700 bg-gray-900/50 p-12 text-center transition-all hover:border-blue-500/50 hover:bg-gray-800/50">
          {/* Hiệu ứng phát sáng nhẹ ở góc khi hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative z-10">
            <p className="text-gray-400 font-medium tracking-wide">
              No submissions yet.
            </p>

            <Link
              href="/submit"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
            >
              Submit your first module
              <svg
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="group flex items-start justify-between rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-gray-700 hover:bg-gray-800/50 hover:shadow-md"
            >
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-gray-100">{sub.name}</p>
                  <p className="text-xs text-gray-500">
                    {sub.category.name} · {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {sub.feedback && (
                  <div className="mt-2 rounded-lg border border-gray-800 bg-gray-800/40 px-3 py-2 text-xs text-gray-400 italic">
                    <span className="font-bold text-gray-500 mr-1 not-italic">Feedback:</span>
                    {sub.feedback}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* STATUS - Đảm bảo statusStyles của bạn có màu sắc hợp với nền tối */}
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[sub.status]}`}
                >
                  {sub.status}
                </span>

                {/* DELETE BUTTON */}
                {sub.status === "PENDING" && (
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <DeleteButton id={sub.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
