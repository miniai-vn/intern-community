"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitModuleSchema } from "@/lib/validations";
import type { Category } from "@/types";

interface SubmitFormProps {
  categories: Category[];
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = submitModuleSchema.safeParse(data);

    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.fieldErrors ?? { _: ["Submission failed. Try again."] });
        return;
      }

      router.push("/my-submissions");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Module name" name="name" error={error.name}>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Quantum Auth Engine"
            maxLength={60}
            className={inputClass(Boolean(error.name))}
            aria-invalid={Boolean(error.name)}
          />
        </Field>

        <Field label="Category" name="categoryId" error={error.categoryId}>
          <select
            id="categoryId"
            name="categoryId"
            className={inputClass(Boolean(error.categoryId))}
            defaultValue=""
            aria-invalid={Boolean(error.categoryId)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Description"
        name="description"
        error={error.description}
        hint="Max 500 characters"
      >
        {/* TODO [easy-challenge]: add a live character counter below this textarea */}
        <textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Describe the core functionality and technical architecture..."
          maxLength={500}
          className={inputClass(Boolean(error.description))}
          aria-invalid={Boolean(error.description)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="GitHub repository URL" name="repoUrl" error={error.repoUrl}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-500" aria-hidden="true">
              <CodeIcon />
            </span>
            <input
              id="repoUrl"
              name="repoUrl"
              type="url"
              placeholder="https://github.com/..."
              className={inputClass(Boolean(error.repoUrl), true)}
              aria-invalid={Boolean(error.repoUrl)}
            />
          </div>
        </Field>

        <Field label="Demo URL" name="demoUrl" error={error.demoUrl}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-500" aria-hidden="true">
              <RocketIcon />
            </span>
            <input
              id="demoUrl"
              name="demoUrl"
              type="url"
              placeholder="https://demo.example.com"
              className={inputClass(Boolean(error.demoUrl), true)}
              aria-invalid={Boolean(error.demoUrl)}
            />
          </div>
        </Field>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-indigo-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{isSubmitting ? "Submitting…" : "Submit Module for Review"}</span>
        <SendIcon />
      </button>

      {error._ && (
        <p className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error._.join(", ")}
        </p>
      )}
    </form>
  );
}

function inputClass(hasError: boolean, withLeftIcon = false) {
  return [
    "w-full rounded-xl border bg-slate-950 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500",
    withLeftIcon ? "pl-10 pr-3" : "px-3",
    hasError
      ? "border-red-400/55 focus-visible:border-red-300 focus-visible:ring-2 focus-visible:ring-red-400/25"
      : "border-indigo-300/20 focus-visible:border-violet-400/65 focus-visible:ring-2 focus-visible:ring-violet-400/25",
  ].join(" ");
}

function Field({
  label,
  name,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <label htmlFor={name} className="ml-1 block text-xs font-semibold tracking-[0.04em] text-sky-200">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-300">{error.join(", ")}</p>}
    </div>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 9L5 12L8 15" />
      <path d="M16 9L19 12L16 15" />
      <path d="M13 7L11 17" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20L9 15" />
      <path d="M14 10L9 15" />
      <path d="M15 9C17.5 6.5 18 3.5 18 3.5C18 3.5 15 4 12.5 6.5L8 11L13 16L15 14" />
      <path d="M10.5 18.5L7 15" />
      <path d="M5 19L3 21" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M21.7 3.2C21.5 3.1 21.2 3 21 3C20.8 3 20.5 3.1 20.3 3.2L3.5 10.4C3 10.6 2.7 11.1 2.7 11.6C2.7 12.2 3 12.7 3.6 12.9L10.3 15.4L12.8 22.1C13 22.6 13.5 23 14.1 23C14.7 23 15.2 22.7 15.4 22.1L22.6 5.3C22.9 4.6 22.6 3.8 21.7 3.2Z" />
    </svg>
  );
}
