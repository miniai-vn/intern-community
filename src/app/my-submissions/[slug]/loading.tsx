export default function RejectedSubmissionLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-2 sm:px-8">
      <div className="h-5 w-56 animate-pulse rounded bg-slate-800" />
      <div className="h-96 animate-pulse rounded-3xl border border-indigo-300/15 bg-slate-900/70" />
    </div>
  );
}
