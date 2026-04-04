import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/admin-dashboard";

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
    take: 10, // Increased limit for better audit log
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
        <p className="text-sm text-gray-500">Manage community submissions and maintain quality standards.</p>
      </div>

      <AdminDashboard 
        initialPending={pending} 
        initialRecentlyReviewed={recentlyReviewed} 
      />
    </div>
  );
}
