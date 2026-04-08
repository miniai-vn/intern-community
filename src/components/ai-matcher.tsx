"use client";

import { useState, useTransition } from "react";
import { askAI } from "@/app/actions/ai";

interface AIMatcherJob {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  author: string | null;
}

interface AIMatchResult {
  recommendedReferenceModule: string;
  whyItFitsYourProfile: string;
  howToContribute: string;
}

interface AIMatcherProps {
  jobs: AIMatcherJob[];
}

export function AIMatcher({ jobs }: AIMatcherProps) {
  const [skills, setSkills] = useState("");
  const [result, setResult] = useState<AIMatchResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAskAI() {
    setError("");
    setResult(null);

    startTransition(() => {
      void askAI(skills, jobs)
        .then((nextResult) => {
          setResult(nextResult);
        })
        .catch((caughtError) => {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to get an AI recommendation right now.";
          setError(message);
        });
    });
  }

  return (
    <section className="rounded-2xl border border-sky-100/80 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm shadow-sky-100/40">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Module Discovery
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {"\u2728"} Module Onboarding Assistant
          </h2>
          <p className="text-sm text-slate-600">
            Input your current skills and interests. AI will suggest the best existing
            modules for you to learn from and guide you on how to make your first
            contribution.
          </p>
        </div>

        <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
          {jobs.length} modules indexed
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Your skills and interests</span>
          <textarea
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="e.g., I know Java and MySQL, looking for a backend module to learn from..."
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAskAI}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <Spinner /> : null}
            {isPending ? "Analyzing..." : "Find My Match"}
          </button>
          <p className="text-xs text-slate-500">
            Results are generated from the approved community modules already listed on this page.
          </p>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div
          className={`rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-all duration-300 ${
            result
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          aria-live="polite"
        >
          {result ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Onboarding Recommendation
              </p>
              <ul className="list-inside list-disc space-y-3 text-sm leading-6 text-slate-700">
                <li>
                  <span className="font-semibold text-slate-900">Recommended Reference Module:</span>{" "}
                  {result.recommendedReferenceModule}
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Why it fits your profile:</span>{" "}
                  {result.whyItFitsYourProfile}
                </li>
                <li>
                  <span className="font-semibold text-slate-900">How to contribute:</span>{" "}
                  {result.howToContribute}
                </li>
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Your onboarding recommendation will appear here after Gemini analyzes your skills.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        className="opacity-90"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
