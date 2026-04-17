import Link from "next/link";
import {
  fetchContributorLeaderboard,
  type LeaderboardContributor,
} from "@/lib/github";

export const revalidate = 600;

export default async function LeaderboardPage() {
  let contributors: LeaderboardContributor[] = [];
  let hasError = false;

  try {
    contributors = await fetchContributorLeaderboard();
  } catch {
    hasError = true;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contributor Leaderboard</h1>
        <p className="text-sm text-gray-500">
          Top GitHub contributors in the intern-community repository.
        </p>
      </div>

      {hasError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load contributor data from GitHub API. Please try again later.
        </div>
      ) : contributors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No contributors found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-[64px_1fr_96px] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>Rank</span>
            <span>Contributor</span>
            <span className="text-right">Commits</span>
          </div>

          <div className="divide-y divide-gray-100">
            {contributors.map((user, index) => (
              <div
                key={user.id}
                className="grid grid-cols-[64px_1fr_96px] items-center gap-3 px-4 py-3"
              >
                <span className="text-sm font-semibold text-gray-900">#{index + 1}</span>

                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={`${user.login} avatar`}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                  <Link
                    href={user.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium text-blue-600 hover:underline"
                  >
                    {user.login}
                  </Link>
                </div>

                <span className="text-right text-sm font-medium text-gray-700">
                  {user.contributions}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
