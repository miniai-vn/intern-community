import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module Analytics</h1>
        <p className="text-sm text-gray-500">
          View tracking insights and engagement metrics across all modules.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
