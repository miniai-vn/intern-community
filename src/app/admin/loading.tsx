export default function AdminLoading() {
  return (
    <div className="mx-auto w-full max-w-360 space-y-6 px-2 sm:px-8">
      <div className="h-44 animate-pulse rounded-3xl border border-indigo-300/15 bg-slate-900/70" />
      <div className="space-y-4 rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-8">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-52 animate-pulse rounded-xl border border-indigo-300/15 bg-slate-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
