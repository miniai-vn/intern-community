/**
 * Builds home page URLs so search (`q`) and category filter compose correctly.
 */
export function buildBrowseHref(filters: {
  q?: string | null;
  category?: string | null;
}): string {
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  if (q) params.set("q", q);
  if (filters.category) params.set("category", filters.category);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
