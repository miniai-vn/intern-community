import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import { FilterControls } from "../components/filter-controls";
import { RetryHomeButton } from "@/components/retry-home-button";
import type { Module } from "@/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort = "votes" } = await searchParams;
  const session = await auth();
  let modules: Awaited<ReturnType<typeof db.miniApp.findMany>> = [];
  let categories: Awaited<ReturnType<typeof db.category.findMany>> = [];
  let votedIds = new Set<string>();
  let listError: string | null = null;

  // Derive order by from sort param
  const orderBy: any = 
    sort === "newest" ? { createdAt: "desc" } :
    sort === "oldest" ? { createdAt: "asc" } :
    { voteCount: "desc" };

  try {
    modules = await db.miniApp.findMany({
      where: {
        status: "APPROVED",
        ...(category ? { category: { slug: category } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, image: true } },
      },
      orderBy,
      take: 12,
    });

    if (session?.user) {
      const votes = await db.vote.findMany({
        where: {
          userId: session.user.id,
          moduleId: { in: modules.map((m) => m.id) },
        },
        select: { moduleId: true },
      });
      votedIds = new Set(votes.map((v) => v.moduleId));
    }

    categories = await db.category.findMany({ orderBy: { name: "asc" } });
  } catch (err) {
    console.error("Home loading error:", err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code)
        : "";
    listError =
      code === "ECONNREFUSED" || code === "P1001"
        ? "Không kết nối được cơ sở dữ liệu. Hãy bật PostgreSQL (ví dụ: chạy docker compose up -d trong thư mục project) và kiểm tra DATABASE_URL trong file .env."
        : "Không tải được danh sách module. Vui lòng thử lại.";
  }

  return (
    <div className="space-y-10 py-4">
      {/* Hero Section - Re-styled for premium look */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 px-8 py-16 text-center text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Intern <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">Community</span> Hub
          </h1>
          <p className="max-w-2xl text-lg text-blue-100/80">
            Khám phá kho lưu trữ mini-app, công cụ và module tiện ích được xây dựng bởi cộng đồng thực tập sinh TD.
          </p>
        </div>
      </div>

      {/* Advanced Filter UI */}
      <FilterControls 
        categories={categories} 
        currentCategory={category} 
        currentQuery={q}
        currentSort={sort}
      />

      {listError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-12 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-800">{listError}</p>
          <RetryHomeButton />
        </div>
      ) : modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-4 text-gray-400">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900">Không tìm thấy module nào</p>
          <p className="mt-1 text-gray-500">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
          {(q || category) && (
            <Link href="/" className="mt-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Xóa tất cả bộ lọc
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module as unknown as Module}
              hasVoted={votedIds.has(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
