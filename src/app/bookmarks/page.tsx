import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ModuleCard } from "@/components/module-card";
import Link from "next/link";
import BackButton from "@/components/back-button";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  let votedIds = new Set<string>();
  const bookmarks = await db.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      module: {
        include: {
          category: true,
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  const modules = bookmarks.map((b) => b.module);

  const votes = await db.vote.findMany({
    where: {
      userId: session.user.id,
      moduleId: { in: modules.map((m) => m.id) },
    },
    select: { moduleId: true },
  });

  votedIds = new Set(votes.map((v) => v.moduleId));
  return (
    <div className="space-y-6">
      <BackButton />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
        <p className="text-sm text-gray-500">
          Modules you saved to revisit later.
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No bookmarks yet.</p>
          <Link
            href="/"
            className="mt-2 block text-sm text-blue-600 hover:underline">
            Browse modules
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              hasVoted={votedIds.has(module.id)}
              hasBookmarked={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
