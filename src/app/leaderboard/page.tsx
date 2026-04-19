import { getLeaderboardData, LEADERBOARD_REVALIDATE } from "@/lib/leaderboard";

export const revalidate = 600;

// Function to extract the first letter
const getInitial = (name: string) => name.charAt(0).toUpperCase();

// Function selects a random color based on name
const getBgColor = (name: string) => {
    const colors = [
        'bg-pink-500', 'bg-purple-500', 'bg-indigo-500',
        'bg-blue-500', 'bg-cyan-500', 'bg-teal-500',
        'bg-emerald-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default async function LeaderboardPage() {
    const data = await getLeaderboardData();
    const topThree = data.slice(0, 3);
    const others = data.slice(3);

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                        Community <span className="text-blue-600">Leaderboard</span>
                    </h1>
                </div>

                {/* TOP 3 PODIUM */}
                <div className="flex flex-col sm:flex-row items-end justify-center gap-4 mb-12 px-2">
                    {/* Rank 2 */}
                    {topThree[1] && (
                        <div className="order-2 sm:order-1 flex-1 w-full max-w-50 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className={`w-20 h-20 rounded-full border-4 border-slate-300 shadow-lg flex items-center justify-center text-black text-3xl font-bold overflow-hidden ${topThree[1].image ? '' : getBgColor(topThree[1].name || "")}`}>
                                    {getInitial(topThree[1].name || "U")}
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">#2</div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-t-2xl p-4 w-full text-center shadow-sm h-32 flex flex-col justify-center">
                                <p className="font-bold text-gray-800 line-clamp-1">{topThree[1].name}</p>
                                <p className="text-blue-600 font-black text-xl">{topThree[1].count}</p>
                                <p className="text-[10px] uppercase text-gray-400 font-bold">Modules</p>
                                <span className="flex items-center justify-center text-[9px] text-gray-400 uppercase font-bold mt-1 tracking-tighter">
                                    Total {topThree[1].totalVotes} Votes
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 - The King */}
                    {topThree[0] && (
                        <div className="order-1 sm:order-2 flex-1 w-full max-w-60 flex flex-col items-center z-10">
                            <div className="relative mb-4 scale-110">
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">👑</span>
                                <div className={`w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl flex items-center justify-center text-black text-4xl font-black overflow-hidden ${topThree[0].image ? '' : getBgColor(topThree[0].name || "")}`}>
                                    {getInitial(topThree[0].name || "U")}
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-3 py-0.5 rounded-full border-2 border-white">#1</div>
                            </div>
                            <div className="bg-white border-2 border-yellow-200 rounded-t-3xl p-6 w-full text-center shadow-xl h-44 flex flex-col justify-center ring-4 ring-yellow-400/10">
                                <p className="font-black text-gray-900 text-lg line-clamp-1">{topThree[0].name}</p>
                                <p className="text-yellow-500 font-black text-3xl">{topThree[0].count}</p>
                                <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Master Developer</p>
                                <span className="flex items-center justify-center text-[9px] text-gray-400 uppercase font-bold mt-1 tracking-tighter">
                                    Total {topThree[0].totalVotes} Votes
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {topThree[2] && (
                        <div className="order-3 flex-1 w-full max-w-50 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className={`w-20 h-20 rounded-full border-4 border-orange-300 shadow-lg flex items-center justify-center text-black text-3xl font-bold overflow-hidden ${topThree[2].image ? '' : getBgColor(topThree[2].name || "")}`}>
                                    {getInitial(topThree[2].name || "U")}
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">#3</div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-t-2xl p-4 w-full text-center shadow-sm h-28 flex flex-col justify-center">
                                <p className="font-bold text-gray-800 line-clamp-1">{topThree[2].name}</p>
                                <p className="text-blue-600 font-black text-xl">{topThree[2].count}</p>
                                <p className="text-[10px] uppercase text-gray-400 font-bold">Modules</p>
                                <span className="flex items-center justify-center text-[9px] text-gray-400 uppercase font-bold mt-1 tracking-tighter">
                                    Total {topThree[2].totalVotes} Votes
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Others List */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Detailed rankings
                    </div>
                    <div className="divide-y divide-gray-50">
                        {others.map((user, index) => (
                            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-blue-50/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 text-center font-bold text-gray-400">#{index + 4}</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm overflow-hidden ${user.image ? '' : getBgColor(user.name || "")}`}>
                                        {getInitial(user.name || "U")}
                                    </div>
                                    <span className="font-semibold text-gray-700">{user.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{user.count}</span>
                                    <span className="text-[10px] uppercase text-black-400 font-bold">Modules</span>
                                    <span className="flex items-center justify-center text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                                        Total {user.totalVotes} Votes
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}