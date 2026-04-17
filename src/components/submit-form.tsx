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
  const [description, setDescription] = useState("");
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

  const descLength = description.length;
  const isNearLimit = descLength >= 450;
  const isAtLimit = descLength >= 500;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Module name" name="name" error={error.name}>
        <input
          name="name"
          type="text"
          placeholder="e.g. Pomodoro Timer"
          maxLength={60}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Description" name="description" error={error.description}>
        <div className="relative">
          <textarea
            name="description"
            rows={4}
            placeholder="What does your module do? Who is it for?"
            maxLength={500}
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="mt-1.5 flex justify-end">
            <span 
              className={`text-[10px] font-mono tracking-wider tabular-nums px-1.5 py-0.5 rounded transition-colors
                ${isAtLimit 
                  ? "bg-destructive/10 text-destructive font-bold" 
                  : isNearLimit 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 font-medium" 
                    : "text-muted-foreground"}`}
            >
              {descLength} / 500
            </span>
          </div>
        </div>
      </Field>

      <Field label="Category" name="categoryId" error={error.categoryId}>
        <select name="categoryId" className={inputClass} defaultValue="" required>
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
          required
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
        <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg">
          {error._.join(", ")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? "Submitting..." : "Submit Module"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground";

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
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive font-medium">{error.join(", ")}</p>}
    </div>
  );
}
