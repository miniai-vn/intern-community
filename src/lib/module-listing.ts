import type { Module } from "@/types";

interface ModuleListingSearchParams {
  q?: string;
  category?: string;
  cursor?: string | null;
}

export function buildModuleListingSearchParams({
  q,
  category,
  cursor,
}: ModuleListingSearchParams) {
  const searchParams = new URLSearchParams();

  if (q) {
    searchParams.set("q", q);
  }

  if (category) {
    searchParams.set("category", category);
  }

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return searchParams.toString();
}

export function mergeModuleListingPages(current: Module[], incoming: Module[]) {
  const byId = new Map(current.map((item) => [item.id, item]));

  for (const item of incoming) {
    byId.set(item.id, item);
  }

  return Array.from(byId.values());
}
