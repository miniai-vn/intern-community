export default function HomeLoading() {
  return (
    <div className="relative -mx-4 px-4 pb-6 text-slate-100 sm:px-6 lg:px-8">
      <section className="relative px-1 pt-8 pb-10 sm:px-3 sm:pt-10 sm:pb-12">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <div className="mx-auto h-4 w-32 animate-pulse rounded bg-slate-800" />
          <div className="mx-auto h-12 w-80 animate-pulse rounded bg-slate-800" />
          <div className="mx-auto h-10 w-full max-w-xl animate-pulse rounded-full bg-slate-900" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 bg-slate-900/35 px-1 py-10 sm:gap-5 sm:px-3 sm:py-12 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            className="h-60 animate-pulse rounded-xl border border-indigo-300/10 bg-slate-900/70"
          />
        ))}
      </section>
    </div>
  );
}
