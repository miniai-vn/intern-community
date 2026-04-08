import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ModuleCard } from "@/components/module-card";

export default async function MyFavoritesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Get user's favorite modules
  const favorites = await db.favorite.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      module: {
        include: {
          category: true,
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const modules = favorites.map((f) => f.module);

  // Fetch which modules the current user has voted on
  const votes = await db.vote.findMany({
    where: {
      userId: session.user.id,
      moduleId: { in: modules.map((m) => m.id) },
    },
    select: { moduleId: true },
  });
  const votedIds = new Set(votes.map((v) => v.moduleId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites ⭐</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modules you&apos;ve bookmarked for later.
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">No favorites yet.</p>
          <Link href="/" className="mt-2 block text-sm text-blue-600 hover:underline dark:text-blue-400">
            Explore modules
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedIds.has(module.id)}
              hasFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
