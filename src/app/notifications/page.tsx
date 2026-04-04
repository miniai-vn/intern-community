import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MarkAllRead } from "./mark-read";

export const metadata = { title: "Notifications — Intern Community Hub" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    include: { module: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });


  if (notifications.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        No notifications yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <MarkAllRead />
      <h1 className="mb-6 text-xl font-bold text-gray-900">Notifications</h1>
      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`flex items-start justify-between gap-4 px-4 py-3 ${!n.read ? "bg-blue-50" : ""}`}
          >
            <div>
              <p className="text-sm text-gray-800">
                <Link href={`/modules/${n.module.slug}`} className="font-medium hover:underline">
                  {n.module.name}
                </Link>{" "}
                was{" "}
                <span className={n.status === "APPROVED" ? "font-medium text-green-600" : "font-medium text-red-600"}>
                  {n.status === "APPROVED" ? "approved" : "rejected"}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
