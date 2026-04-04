import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { CommunityStats } from "@/types";

export const revalidate = 600; // 10 minutes

export async function GET() {
  try {
    const [totalModules, byStatusRaw, topCategoriesRaw] = await Promise.all([
      db.miniApp.count(),
      db.miniApp.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.miniApp.groupBy({
        by: ["categoryId"],
        where: { status: "APPROVED" },
        _count: { id: true },
        orderBy: {
          _count: { id: "desc" },
        },
        take: 5,
      }),
    ]);

    // Fetch category details for the top categories
    const categoryIds = topCategoriesRaw.map((t) => t.categoryId);
    const categories = await db.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, slug: true },
    });

    const stats: CommunityStats = {
      totalModules,
      byStatus: byStatusRaw.map((s: any) => ({
        status: s.status,
        _count: s._count.id,
      })),
      topCategories: topCategoriesRaw.map((t: any) => {
        const cat = categories.find((c: any) => c.id === t.categoryId);
        return {
          category: {
            name: cat?.name || "Unknown",
            slug: cat?.slug || "unknown",
          },
          _count: t._count.id,
        };
      }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
