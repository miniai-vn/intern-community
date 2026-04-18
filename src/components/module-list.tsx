"use client";

import { useState } from "react";
import { ModuleCard } from "@/components/module-card";

export function ModuleList({ initialModules, initialCursor }) {
    const [modules, setModules] = useState(initialModules);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        if (!cursor) return;

        setLoading(true);

        const res = await fetch(`/api/modules?cursor=${cursor}`);
        const data = await res.json();

        setModules((prev) => [...prev, ...data.modules]);
        setCursor(data.nextCursor);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module) => (
                    <ModuleCard key={module.id} module={module} />
                ))}
            </div>

            {/* Load more */}
            {cursor && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </div>
    );
}