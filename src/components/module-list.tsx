"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/types";
import { MagnifyingGlass, Funnel, X, ArrowDown } from "@phosphor-icons/react";

interface ModuleListProps {
  initialModules: Module[];
  initialVotedIds: Set<string>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

interface ApiResponse {
  items: Module[];
  nextCursor: string | null;
}

export function ModuleList({
  initialModules,
  initialVotedIds,
  categories,
}: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [votedIds, setVotedIds] = useState<Set<string>>(initialVotedIds);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get("q");
  const category = searchParams.get("category");
  
  // Initialize selected categories from URL
  useEffect(() => {
    if (category) {
      setSelectedCategories(category.split(','));
    } else {
      setSelectedCategories([]);
    }
  }, [category]);

  // Load initial data and determine if there are more items
  useEffect(() => {
    console.log("Initial modules loaded:", initialModules.length);
    console.log("Search:", search, "Category:", category);
    
    // Show Load More if we have exactly 3 items (limit reached)
    const hasMoreItems = initialModules.length === 3;
    setHasMore(hasMoreItems);
    console.log("Set hasMore to:", hasMoreItems);
    
    if (initialModules.length > 0) {
      setNextCursor(initialModules[initialModules.length - 1].id);
      console.log("Set nextCursor to:", initialModules[initialModules.length - 1].id);
    }
  }, [initialModules, search, category]);

  // Re-fetch data when search or category changes
  useEffect(() => {
    // Only re-fetch if search or category actually changed from initial load
    if ((search !== undefined && search !== null) || (category !== undefined && category !== null)) {
      const fetchInitialData = async () => {
        try {
          const params = new URLSearchParams();
          if (search) params.set("q", search);
          if (category) params.set("category", category);
          
          const response = await fetch(`/api/modules?${params}`);
          if (!response.ok) throw new Error("Failed to fetch");
          
          const data: ApiResponse = await response.json();
          console.log("Refetched data:", data);
          
          setModules(data.items);
          setHasMore(data.nextCursor !== null);
          if (data.items.length > 0) {
            setNextCursor(data.items[data.items.length - 1].id);
          }
        } catch (error) {
          console.error("Error refetching data:", error);
        }
      };
      
      fetchInitialData();
    }
  }, [search, category]);

  const loadMore = async () => {
    console.log("Load more clicked. nextCursor:", nextCursor, "isLoading:", isLoading);
    if (!nextCursor || isLoading) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("q", search);
      params.set("cursor", nextCursor);

      const url = `/api/modules?${params}`;
      console.log("Fetching from:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data: ApiResponse = await response.json();
      console.log("API response:", data);

      // Hide Load More button if no more items
      if (data.items.length === 0) {
        setHasMore(false);
        return;
      }

      setModules(prev => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);

      // Update voted IDs for new modules
      if (data.items.length > 0) {
        setVotedIds(prev => {
          const newVotedIds = new Set(prev);
          // Note: We could fetch vote status for new modules here
          // For now, we'll keep the existing voted IDs
          return newVotedIds;
        });
      }
    } catch (error) {
      console.error("Error loading more modules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categorySlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentCategories = category ? category.split(',') : [];
    
    if (currentCategories.includes(categorySlug)) {
      // Remove category if already selected
      const updatedCategories = currentCategories.filter(c => c !== categorySlug);
      if (updatedCategories.length > 0) {
        newParams.set("category", updatedCategories.join(','));
      } else {
        newParams.delete("category");
      }
    } else {
      // Add category if not selected
      const updatedCategories = [...currentCategories, categorySlug];
      newParams.set("category", updatedCategories.join(','));
    }
    
    router.push(`/?${newParams}`);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    newParams.delete("category");
    router.push(`/?${newParams}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Community Modules</h1>
          <p className="text-sm text-gray-600 mt-1">
            Discover mini-apps built by the Intern developer community.
          </p>
        </div>

        <form 
          className="flex gap-2" 
          action="/"
          method="GET"
        >
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
              weight="regular"
            />
            <input
              name="q"
              defaultValue={search || ""}
              placeholder="Search modules..."
              className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            <MagnifyingGlass weight="regular" className="w-4 h-4" />
            Search
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleCategory("")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            selectedCategories.length === 0
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => toggleCategory(c.slug)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              selectedCategories.includes(c.slug)
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.name}
            {selectedCategories.includes(c.slug) && (
              <X weight="bold" className="w-3 h-3" />
            )}
          </button>
        ))}
      </div>

      {/* Active Filters */}
      {(search || selectedCategories.length > 0) && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Funnel weight="regular" className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Active filters: {search && `"${search}"`} {search && selectedCategories.length > 0 && " + "} {selectedCategories.map(cat => {
              const category = categories.find(c => c.slug === cat);
              return category?.name || cat;
            }).join(", ")}
          </span>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          >
            <X weight="bold" className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}

      {/* Modules Grid */}
      {modules.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MagnifyingGlass weight="regular" className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No modules found.</p>
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search or filters.
          </p>
          {(search || selectedCategories.length > 0) && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <X weight="bold" className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <ModuleCard
                key={`${module.id}-${index}`}
                module={module}
                hasVoted={votedIds.has(module.id)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ArrowDown weight="regular" className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
