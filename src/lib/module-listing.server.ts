import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Module } from "@/types";

interface ListModulesPageOptions {
  q?: string;
  category?: string;
  cursor?: string | null;
  userId?: string;
}

interface ModulesPageResult {
  items: Module[];
  nextCursor: string | null;
}

const MODULE_PAGE_SIZE = 12;

const moduleListingInclude = {
  category: true,
  author: { select: { id: true, name: true, image: true } },
} satisfies Prisma.MiniAppInclude;

export async function listModulesPage({
  q,
  category,
  cursor,
  userId,
}: ListModulesPageOptions): Promise<ModulesPageResult> {
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
    // NOTE: Always include category and author to avoid N+1 on listing pages.
    // DO NOT remove the include without running EXPLAIN ANALYZE on the query.
    include: moduleListingInclude,
    orderBy: [{ voteCount: "desc" }, { id: "desc" }],
    take: MODULE_PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = modules.length > MODULE_PAGE_SIZE;
  const pageItems = hasMore ? modules.slice(0, MODULE_PAGE_SIZE) : modules;
  const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null;

  if (!userId || pageItems.length === 0) {
    return {
      items: pageItems.map((module) => ({ ...module, hasVoted: false })),
      nextCursor,
    };
  }

  const votes = await db.vote.findMany({
    where: {
      userId,
      moduleId: { in: pageItems.map((module) => module.id) },
    },
    select: { moduleId: true },
  });

  const votedIds = new Set(votes.map((vote) => vote.moduleId));

  return {
    items: pageItems.map((module) => ({
      ...module,
      hasVoted: votedIds.has(module.id),
    })),
    nextCursor,
  };
}
