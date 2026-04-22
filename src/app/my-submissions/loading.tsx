export default function MySubmissionsLoading() {
  return (
    <div className="mx-auto w-full max-w-360 space-y-6 px-2 sm:px-8">
      <div className="h-44 animate-pulse rounded-3xl border border-indigo-300/15 bg-slate-900/70" />
      <div className="h-10 w-40 animate-pulse rounded-full bg-slate-800" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-20 animate-pulse rounded-xl border border-indigo-300/15 bg-slate-900/70"
          />
        ))}
      </div>
    </div>
  );
}
