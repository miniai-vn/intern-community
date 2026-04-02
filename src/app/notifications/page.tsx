import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NotificationsPanel } from "@/components/notifications-panel";
import { getNotificationsForUser } from "@/lib/notifications";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { items, unreadCount } = await getNotificationsForUser(session.user.id);

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

      <NotificationsPanel
        initialNotifications={items}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}