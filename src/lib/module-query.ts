import { db } from "@/lib/db";

export async function getModules({
  cursor,
  q,
  category,
}: {
  cursor?: string;
  q?: string;
  category?: string;
}) {
  const limit = 3;

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
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = modules.length > limit;
  const items = hasMore ? modules.slice(0, limit) : modules;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { modules: items, nextCursor };
}