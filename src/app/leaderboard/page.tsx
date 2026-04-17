import React from "react";
import { Clock, Eye, Share } from "lucide-react";
import Image from "next/image";
import { getCurrentMonthLeaderboard } from "@/lib/leaderboard";

export const revalidate = 600;

function formatSubmissionCount(value: number) {
  return `${value} approved submission${value === 1 ? "" : "s"}`;
}

export default async function Leaderboard() {
  const leaderboard = await getCurrentMonthLeaderboard();

  if (!leaderboard || leaderboard.contributors.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-semibold text-center text-gray-900 mb-12">
            Top Contributors
          </h1>
          <p className="text-center text-gray-500">
            No contributions yet this month. Be the first to contribute!
          </p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.contributors.slice(0, 3);
  const others = leaderboard.contributors.slice(3);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-center text-gray-900 mb-12">
          Top Contributors
        </h1>

        {/* Render top 3 contributors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {topThree.map((user) => (
            <div
              key={user.userId}
              className="bg-[#f7f7f7] rounded-xl shadow-[5px_5px_10px_-4px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-center pt-8 hover:scale-105 transition-transform duration-200"
            >
              {/* Avatar & Rank Badge */}
              <div className="relative mb-4">
                <Image
                  width={96}
                  height={96}
                  loading="eager"
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`
                  }
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                />
                <div className="absolute bottom-0 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                  {user.rank}
                </div>
              </div>
              {/* User Info */}
              <h3 className="text-lg font-medium text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {user.rank <= 3
                  ? ["🥇", "🥈", "🥉"][user.rank - 1]
                  : `${user.rank}º`}
              </p>
              <span className="bg-[#eef8f9] text-[#4db6ac] px-6 py-1.5 rounded-full text-sm font-medium mb-6">
                {formatSubmissionCount(user.approvedSubmissions)}
              </span>
            </div>
          ))}
        </div>

        {/* Break line */}
        <hr className="border-gray-200 mb-12" />

        {/* List Section */}
        <div className="flex flex-col gap-3">
          {others.map((user) => (
            <div
              key={user.userId}
              className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex items-center justify-between hover:shadow-md hover:bg-[#f7f7f7] transition-shadow duration-200"
            >
              <div className="flex items-center gap-6">
                {/* Percentage */}
                <span className="text-gray-500 font-medium w-12 text-right">
                  {user.rank}
                </span>

                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  <Image
                    width={96}
                    height={96}
                    loading="eager"
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`
                    }
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-base font-medium text-gray-800">
                      {user.name}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Right Badge */}
              <span className="bg-[#eef8f9] text-[#4db6ac] px-6 py-2 rounded-full text-sm font-medium">
                {user.approvedSubmissions} approved{" "}
                {user.approvedSubmissions === 1 ? "submission" : "submissions"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
