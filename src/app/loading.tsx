export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="h-10 w-full sm:w-64 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Categories Skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-16 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="mt-auto flex items-center justify-between pt-4">
              <div className="h-5 w-20 animate-pulse rounded-full bg-blue-100" />
              <div className="h-7 w-12 animate-pulse rounded-md bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
