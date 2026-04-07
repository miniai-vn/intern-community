import { LeaderboardList } from "@/components/leaderboard-list";
import { getMonthlyLeaderboard } from "@/lib/leaderboard";

export const revalidate = 600;

function formatMonthYear(dateIso: string): string {
  const date = new Date(dateIso);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function LeaderboardPage() {
  const leaderboard = await getMonthlyLeaderboard(10);
  const monthLabel = formatMonthYear(leaderboard.monthStartUtc);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Top Contributors</h1>
        <p className="text-sm text-gray-500">
          Ranked by approved module submissions in {monthLabel} (UTC).
        </p>
      </div>

      <LeaderboardList items={leaderboard.items} />
    </div>
  );
}
