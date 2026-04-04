import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { CategoryList } from "@/components/category-list";


export default async function CategoryPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) return notFound();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
      </div>
      <CategoryList initialCategories={categories} />
    </div>
  );
}