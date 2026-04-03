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
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Module name" name="name" error={error.name}>
        <input
          name="name"
          type="text"
          placeholder="e.g. Pomodoro Timer"
          maxLength={60}
          className={inputClass}
        />
      </Field>

      <Field label="Description" name="description" error={error.description} hint="Max 500 characters">
        {/* TODO [easy-challenge]: add a live character counter below this textarea */}
        <textarea
          name="description"
          rows={4}
          placeholder="What does your module do? Who is it for?"
          maxLength={500}
          className={inputClass}
        />
      </Field>

      <Field label="Category" name="categoryId" error={error.categoryId}>
        <select name="categoryId" className={inputClass} defaultValue="">
          <option value="" disabled>Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="GitHub repository URL" name="repoUrl" error={error.repoUrl}>
        <input
          name="repoUrl"
          type="url"
          placeholder="https://github.com/your-username/your-repo"
          className={inputClass}
        />
      </Field>

      <Field label="Demo URL (optional)" name="demoUrl" error={error.demoUrl}>
        <input
          name="demoUrl"
          type="url"
          placeholder="https://your-demo.vercel.app"
          className={inputClass}
        />
      </Field>

      {error._ && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3">
          <p className="text-sm text-red-300">{error._.join(", ")}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 transition"
      >
        {isSubmitting ? "Đang gửi…" : "Submit Module"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 outline-none focus:bg-slate-700 focus:ring-2 focus:ring-purple-500/50 transition";

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error.join(", ")}</p>}
    </div>
  );
}
