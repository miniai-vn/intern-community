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
  const [descriptionLength, setDescriptionLength] = useState(0);

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
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Pomodoro Timer"
          maxLength={60}
          className={inputClass}
        />
      </Field>

      <Field
        label="Description"
        name="description"
        error={error.description}
        hint="Explain what it does, who it helps, and why someone should try it."
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What does your module do? Who is it for?"
          maxLength={500}
          className={`${inputClass} min-h-32 resize-y`}
          onChange={(e) => setDescriptionLength(e.target.value.length)}
        />
        <div className="flex justify-end">
          <p
            className={`text-xs font-medium ${
              descriptionLength >= 450 ? "text-amber-700" : "text-stone-400"
            }`}
          >
            {descriptionLength} / 500
          </p>
        </div>
      </Field>

      <Field label="Category" name="categoryId" error={error.categoryId}>
        <select id="categoryId" name="categoryId" className={inputClass} defaultValue="">
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

      <Field label="GitHub repository URL" name="repoUrl" error={error.repoUrl}>
        <input
          id="repoUrl"
          name="repoUrl"
          type="url"
          placeholder="https://github.com/your-username/your-repo"
          className={inputClass}
        />
      </Field>

      <Field label="Demo URL (optional)" name="demoUrl" error={error.demoUrl}>
        <input
          id="demoUrl"
          name="demoUrl"
          type="url"
          placeholder="https://your-demo.vercel.app"
          className={inputClass}
        />
      </Field>

      {error._ && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error._.join(", ")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-950/15 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Module"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15";

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
      <label htmlFor={name} className="block text-sm font-semibold text-stone-800">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-5 text-stone-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-700">{error.join(", ")}</p>}
    </div>
  );
}
