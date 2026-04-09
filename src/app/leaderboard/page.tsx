import { Metadata } from "next";

// Revalidate every 10 minutes (600 seconds)
export const revalidate = 600;

interface Contributor {
  rank: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  approvedCount: number;
}

interface LeaderboardData {
  contributors: Contributor[];
  month: {
    year: number;
    month: number;
    name: string;
  };
  generatedAt: string;
}

async function getLeaderboardData(): Promise<LeaderboardData> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/leaderboard`, {
    next: { revalidate: 600 }, // 10 minutes
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data');
  }
  
  return response.json();
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return (
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L14.09 8.26L21 9.27L16.5 13.14L17.82 20L12 16.77L6.18 20L7.5 13.14L3 9.27L9.91 8.26L12 2Z"/>
        </svg>
      );
    case 2:
      return (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L14.09 8.26L21 9.27L16.5 13.14L17.82 20L12 16.77L6.18 20L7.5 13.14L3 9.27L9.91 8.26L12 2Z"/>
        </svg>
      );
    case 3:
      return (
        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L14.09 8.26L21 9.27L16.5 13.14L17.82 20L12 16.77L6.18 20L7.5 13.14L3 9.27L9.91 8.26L12 2Z"/>
        </svg>
      );
    default:
      return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
  }
}

function getRankBadgeColor(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    case 2:
      return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    case 3:
      return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.09 8.26L21 9.27L16.5 13.14L17.82 20L12 16.77L6.18 20L7.5 13.14L3 9.27L9.91 8.26L12 2Z"/>
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">
              Contributor Leaderboard
            </h1>
            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L14.09 8.26L21 9.27L16.5 13.14L17.82 20L12 16.77L6.18 20L7.5 13.14L3 9.27L9.91 8.26L12 2Z"/>
            </svg>
          </div>
          <p className="text-gray-600">
            Top 10 contributors for {data.month.name}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {data.contributors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L14.09 8.26L21 9.27L16.5 13.14L17.82 20L12 16.77L6.18 20L7.5 13.14L3 9.27L9.91 8.26L12 2Z"/>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No contributors yet this month
              </h3>
              <p className="text-gray-600">
                Be the first to get your modules approved!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {data.contributors.map((contributor) => (
                <div
                  key={contributor.user.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(contributor.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {contributor.user.image ? (
                      <img
                        src={contributor.user.image}
                        alt={contributor.user.name || 'User'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {(contributor.user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {contributor.user.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {contributor.approvedCount} approved {contributor.approvedCount === 1 ? 'module' : 'modules'}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRankBadgeColor(contributor.rank)}`}>
                    #{contributor.rank}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Leaderboard updates every 10 minutes
          </p>
          <p className="mt-1">
            Rankings reset on the 1st of each month at 00:00 UTC
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Contributor Leaderboard | Intern Community Hub",
  description: "Top 10 contributors for the current month, ranked by approved module submissions",
};
