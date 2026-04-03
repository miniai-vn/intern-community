import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import PageClient from "./PageClient";

// TODO [medium-challenge]: Add category filter with URL query params (state persists on refresh)
// See: ISSUES.md for full acceptance criteria

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const modules = await db.miniApp.findMany({
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
    // DO NOT remove include — avoids N+1 on category/author fields.
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  // Fetch which modules the current user has voted on
  let votedIdsArray: string[] = [];
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: { userId: session.user.id, moduleId: { in: modules.map(m => m.id) } },
      select: { moduleId: true },
    });
    votedIdsArray = votes.map(v => v.moduleId);
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <PageClient
      categories={categories}
      initialModules={modules}
      initialVotedIds={votedIdsArray}
      session={session}
    />
  );
}
