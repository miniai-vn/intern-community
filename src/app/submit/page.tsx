import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto w-full max-w-360 pb-10">
      <section className="relative overflow-hidden px-2 pt-14 pb-10 text-center sm:px-8">
        <div className="pointer-events-none absolute left-1/2 top-8 h-64 w-[min(90vw,760px)] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl space-y-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
            Submit a <span className="bg-linear-to-r from-violet-300 to-sky-300 bg-clip-text text-transparent">Module</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-300">
            Contribute your latest engineering feat to the platform. Share your
            code, document your approach, and help the community grow.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 px-2 pb-10 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(11,14,30,0.45)] backdrop-blur-xl sm:p-8">
            <SubmitForm categories={categories} />
          </div>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <InfoTile
            title="Code Quality"
            description="Ensure your module follows linting standards and includes meaningful tests."
            icon={<CheckIcon />}
            accent="bg-indigo-500/20 text-indigo-100"
          />
          <InfoTile
            title="Documentation"
            description="Include README, setup steps, usage examples, and key API references."
            icon={<DocIcon />}
            accent="bg-sky-500/20 text-sky-100"
          />
          <InfoTile
            title="Review Time"
            description="Most submissions are reviewed by maintainers within 48-72 hours."
            icon={<ClockIcon />}
            accent="bg-violet-500/20 text-violet-100"
          />

          <article className="overflow-hidden rounded-2xl border border-indigo-300/15 bg-linear-to-br from-slate-900 to-indigo-950/50 p-5 shadow-[0_16px_45px_rgba(11,14,30,0.35)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              Pro Tip
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use consistent naming conventions and clear descriptions to improve
              discoverability and approval speed.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

function InfoTile({
  title,
  description,
  icon,
  accent,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-indigo-300/15 bg-slate-900/70 p-5 shadow-[0_14px_35px_rgba(11,14,30,0.3)]">
      <div className="flex items-start gap-4">
        <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 7L10 17L5 12" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2V7H19" />
      <path d="M9 13H15" />
      <path d="M9 17H13" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V12L15 14" />
    </svg>
  );
}
