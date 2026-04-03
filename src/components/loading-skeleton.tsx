export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-700 to-slate-800 rounded ${className}`}
    />
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-6 space-y-4 animate-pulse">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-3 w-full" />
      <LoadingSkeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-4">
        <LoadingSkeleton className="h-10 w-24" />
        <LoadingSkeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
