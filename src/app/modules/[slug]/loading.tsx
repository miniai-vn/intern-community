export default function ModuleDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-360 space-y-8 px-2 sm:px-8">
      <div className="h-5 w-44 animate-pulse rounded bg-slate-800" />
      <div className="h-80 animate-pulse rounded-3xl border border-indigo-300/15 bg-slate-900/70" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-140 animate-pulse rounded-2xl border border-indigo-300/15 bg-slate-900/70 lg:col-span-8" />
        <div className="h-64 animate-pulse rounded-2xl border border-indigo-300/15 bg-slate-900/70 lg:col-span-4" />
      </div>
    </div>
  );
}
