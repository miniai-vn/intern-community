import Image from "next/image";

export const revalidate = 600;

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  approvedCount: number;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/leaderboard`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();
  const maxCount = data.length > 0 ? data[0].approvedCount : 1;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900">
          🏆 BẢNG VÀNG CONTRIBUTOR
        </h1>
        <p className="text-gray-500 mt-3">
          Vinh danh những đóng góp xuất sắc trong tháng này
        </p>
      </div>

      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={item.userId ? `${item.rank}-${item.userId}` : `fallback-${index}`}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold w-10 text-center">
                    {item.rank === 1
                      ? "🥇"
                      : item.rank === 2
                      ? "🥈"
                      : item.rank === 3
                      ? "🥉"
                      : item.rank}
                  </div>
                  <Image
                    src={item.image || `https://avatar.vercel.sh/${item.userId || index}`}
                    alt="avatar"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-bold text-lg">{item.name || "Anonymous"}</div>
                    <div className="text-sm text-gray-400">Contributor</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{item.approvedCount}</div>
                  <div className="text-xs text-gray-400">Approved</div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded">
                <div
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${(item.approvedCount / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">CHƯA CÓ DỮ LIỆU</div>
        )}
      </div>
    </div>
  );
}