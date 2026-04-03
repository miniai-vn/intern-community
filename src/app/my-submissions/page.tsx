import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  APPROVED: "bg-green-500/20 text-green-300 border border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border border-red-500/30",
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
    <div className="relative z-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">My Submissions</h1>
        <Link
          href="/submit"
          className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
        >
          + Submission Mới
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center">
          <p className="text-slate-300">Chưa có submission nào.</p>
          <Link
            href="/submit"
            className="mt-3 inline-block text-sm text-purple-400 hover:text-purple-300 transition"
          >
            Submit module đầu tiên của bạn →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start justify-between rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition"
            >
              <div className="space-y-1 flex-1">
                <p className="font-medium text-slate-100">{sub.name}</p>
                <p className="text-xs text-slate-400">
                  {sub.category.name} ·{" "}
                  {new Date(sub.createdAt).toLocaleDateString("vi-VN")}
                </p>
                {sub.feedback && (
                  <p className="mt-2 rounded-md bg-slate-700/50 px-3 py-2 text-xs text-slate-300 border border-slate-600/30">
                    💬 <strong>Feedback:</strong> {sub.feedback}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ml-4 ${
                  statusStyles[sub.status]
                }`}
              >
                {sub.status === "PENDING" && "⏳ " }
                {sub.status === "APPROVED" && "✅ " }
                {sub.status === "REJECTED" && "❌ " }
                {sub.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
