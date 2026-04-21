"use client";

import { useEffect, useState } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

type TrendingModule = Module & {
  views7d: number;
  trendingScore: number;
};

export function TrendingModules() {
  const [modules, setModules] = useState<TrendingModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/modules/trending?limit=12")
      .then((res) => res.json())
      .then((data) => setModules(data.items ?? []))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No trending modules yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <ModuleCard key={m.id} module={m} hasVoted={m.hasVoted ?? false} />
      ))}
    </div>
  );
}
