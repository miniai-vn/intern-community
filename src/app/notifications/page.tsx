import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NotificationsClient } from "@/components/notifications-client";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  return <NotificationsClient />;
}
