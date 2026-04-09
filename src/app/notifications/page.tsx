import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationsList } from "@/components/notifications-list";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    include: {
      module: {
        select: { id: true, slug: true, name: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">
          Review status updates for your submissions.
        </p>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  );
}
