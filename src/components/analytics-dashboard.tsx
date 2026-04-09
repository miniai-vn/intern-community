"use client";

import { useEffect, useState } from "react";

interface Analytics {
  summary: {
    totalModules: number;
    totalViews: number;
    totalVotes: number;
    views24h: number;
    views7d: number;
  };
  topModules: Array<{
    id: string;
    name: string;
    slug: string;
    voteCount: number;
    viewCount: number;
    views7d: number;
    engagementRate: number;
  }>;
  dailyViews: Array<{ day: string; count: number }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  const maxDailyCount = Math.max(...data.dailyViews.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Modules" value={data.summary.totalModules} />
        <StatCard label="Total Views" value={data.summary.totalViews} />
        <StatCard label="Total Votes" value={data.summary.totalVotes} />
        <StatCard label="Views (24h)" value={data.summary.views24h} highlight />
        <StatCard label="Views (7d)" value={data.summary.views7d} highlight />
      </div>

      {/* Daily views bar chart */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Views — Last 7 Days
        </h2>
        {data.dailyViews.length === 0 ? (
          <p className="text-sm text-gray-400">No view data yet.</p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {data.dailyViews.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center">
                <span className="mb-1 text-xs font-semibold text-gray-800">
                  {d.count}
                </span>
                <div
                  className="w-full rounded-t bg-blue-500 transition-all"
                  style={{
                    height: `${(d.count / maxDailyCount) * 120}px`,
                    minHeight: d.count > 0 ? 4 : 0,
                  }}
                />
                <span className="mt-1 text-xs text-gray-600">
                  {d.day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top modules table */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Top Modules by Views
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-900">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-900">
                <th className="pb-2 font-semibold">#</th>
                <th className="pb-2 font-semibold">Module</th>
                <th className="pb-2 text-right font-semibold">Views</th>
                <th className="pb-2 text-right font-semibold">7d Views</th>
                <th className="pb-2 text-right font-semibold">Votes</th>
                <th className="pb-2 text-right font-semibold">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {data.topModules.map((m, i) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-2 font-medium text-gray-700">{i + 1}</td>
                  <td className="py-2 font-semibold text-gray-900">{m.name}</td>
                  <td className="py-2 text-right font-medium tabular-nums text-gray-900">
                    {m.viewCount}
                  </td>
                  <td className="py-2 text-right font-medium tabular-nums text-gray-900">
                    {m.views7d}
                  </td>
                  <td className="py-2 text-right font-medium tabular-nums text-gray-900">
                    {m.voteCount}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.engagementRate >= 20
                          ? "bg-green-50 text-green-700"
                          : m.engagementRate >= 10
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {m.engagementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium text-gray-700">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
