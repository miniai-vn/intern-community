import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageLayout } from "@/components/admin-page-layout";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  // Fetch initial 12 pending items + 1 extra to detect if more exist
  const pending = await db.miniApp.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 13,
  });

  // Get total count for badge
  const totalPending = await db.miniApp.count({
    where: { status: "PENDING" },
  });

  // Split and determine cursor
  const hasMore = pending.length > 12;
  const initialPending = hasMore ? pending.slice(0, 12) : pending;
  const nextCursor = hasMore ? initialPending[initialPending.length - 1].id : null;

  const recentlyReviewed = await db.miniApp.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <AdminPageLayout
      pending={initialPending}
      nextPendingCursor={nextCursor}
      totalPending={totalPending}
      recentlyReviewed={recentlyReviewed}
    />
  );
}
