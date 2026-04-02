"use client";

import { useState, useMemo } from "react";
import { ModuleCard } from "@/components/module-card";
import type { Module, Category } from "@/types";

interface ModuleListClientProps {
  initialModules: Module[];
  categories: Category[];
  votedIds: string[];
}

export function ModuleListClient({ initialModules, categories, votedIds }: ModuleListClientProps) {
  // 1. Dùng useState để lưu trữ từ khóa tìm kiếm và category đang được chọn
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 2. Dùng useMemo để tính toán lại danh sách module mỗi khi searchQuery hoặc selectedCategory thay đổi.
  // Điều này giúp tránh việc filter lại toàn bộ mảng ở mỗi lần render nếu các state này không đổi, mang lại trải nghiệm mượt mà.
  const filteredModules = useMemo(() => {
    return initialModules.filter((module) => {
      // Kiểm tra xem tên module hoặc mô tả có chứa từ khóa tìm kiếm không (không phân biệt hoa/thường)
      const matchesSearch =
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Kiểm tra xem module có thuộc category đang chọn không (nếu null tức là "All")
      const matchesCategory = selectedCategory
        ? module.category.slug === selectedCategory
        : true;
      
      // Module chỉ được hiển thị nếu thỏa mãn cả 2 điều kiện
      return matchesSearch && matchesCategory;
    });
  }, [initialModules, searchQuery, selectedCategory]);

  // Tối ưu set cho votedIds để check O(1)
  const votedSet = useMemo(() => new Set(votedIds), [votedIds]);

  return (
    <div className="space-y-6">
      {/* Khu vực Search và Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search Bar */}
        <div className="w-full sm:max-w-xs relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules by name..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          />
          {/* Search Icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === c.slug
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hiển thị danh sách Modules sau khi đã được filter */}
      {filteredModules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
          <p className="text-gray-500">No modules found matching your criteria.</p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="mt-3 inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-blue-600 shadow-sm border border-gray-200 hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedSet.has(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
