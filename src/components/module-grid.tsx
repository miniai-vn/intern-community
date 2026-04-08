import { Suspense } from "react";
import { SkeletonCards } from "@/components/skeleton-cards";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";

interface ModuleGridProps {
  modules: Module[];
  votedIds: Set<string>;
}

export function ModuleGrid({ modules, votedIds }: ModuleGridProps) {
  return (
    <Suspense fallback={<SkeletonCards />}>
      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No modules found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedIds.has(module.id)}
            />
          ))}
        </div>
      )}
    </Suspense>
  );
}
