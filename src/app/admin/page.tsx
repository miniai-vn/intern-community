import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminReviewCard } from "@/components/admin-review-card";
import { DeleteSubmissionButton } from "../my-submissions/delete-button";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const pending = await db.miniApp.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const recentlyReviewed = await db.miniApp.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-2xl font-bold text-gray-900">Admin — Module Management</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          Pending Submissions 
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 border border-dashed rounded-xl text-center">No pending submissions!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((module) => (
              <AdminReviewCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Recently Processed</h2>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {recentlyReviewed.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No reviewed modules yet.</p>
          ) : (
            recentlyReviewed.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{module.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                    {module.category.name} • By {module.author.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      module.status === "APPROVED"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {module.status}
                  </span>
                  
                  {/* Delete button for admin */}
                  <DeleteSubmissionButton id={module.id} name={module.name} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}