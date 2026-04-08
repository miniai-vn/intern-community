import Image from "next/image";
import { getLeaderboardData } from "@/app/api/leaderboard/route";

export const revalidate = 600;

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Community Leaderboard
        </h1>
        <p className="mt-2 text-gray-600">
          Top contributors for the current month, ranked by approved modules.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Developer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-sm font-semibold text-gray-900"
              >
                Approved Submissions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No approved submissions yet this month. Be the first!
                </td>
              </tr>
            ) : (
              leaderboard.map((item) => (
                <tr key={item.user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                    #{item.rank}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.user.image ? (
                        <Image
                          src={item.user.image}
                          alt={item.user.name || "Avatar"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold">
                          {item.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {item.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-orange-600">
                    {item.count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
