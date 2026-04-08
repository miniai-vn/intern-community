export function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-32 rounded bg-gray-200" />
        <div className="h-5 w-5 rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>
      <div className="mt-auto flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
        <div className="h-5 w-12 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function SkeletonCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
