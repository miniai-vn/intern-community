import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/notification-list";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Mark all as read on page visit (server-side)
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
