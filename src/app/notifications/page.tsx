import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationsPanel } from "@/components/notifications-panel";

type NotificationListItem = {
  id: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  type: "APPROVED" | "REJECTED";
  miniApp: {
    id: string;
    slug: string;
    name: string;
  };
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.user.id },
      include: {
        miniApp: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.notification.count({
      where: { userId: session.user.id, readAt: null },
    }),
  ]);

  const initialNotifications: NotificationListItem[] = notifications.map((notification) => ({
    id: notification.id,
    message: notification.message,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
    type: notification.type,
    miniApp: notification.miniApp,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            Status updates for your submissions appear here.
          </p>
        </div>

        <Link href="/my-submissions" className="text-sm text-blue-600 hover:underline">
          View my submissions
        </Link>
      </div>

      {initialNotifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">You do not have any notifications yet.</p>
        </div>
      ) : (
        <NotificationsPanel
          initialNotifications={initialNotifications}
          initialUnreadCount={unreadCount}
        />
      )}
    </div>
  );
}