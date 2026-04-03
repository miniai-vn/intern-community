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

  // Local textarea state is needed so the counter can update on every keystroke.
  const [description, setDescription] = useState("");

  // Counter thresholds:
  // - >= 400: warning zone (yellow)
  // - >= 500: hard limit reached (red)
  const descriptionLength = description.length;
  const isDescriptionNearLimit = descriptionLength >= 400 && descriptionLength < 500;
  const isDescriptionAtLimit = descriptionLength >= 500;

  const descriptionCounterClass = isDescriptionAtLimit
    ? "text-destructive"
    : isDescriptionNearLimit
      ? "text-amber-300"
      : "text-muted-foreground";

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

      <Field label="Description" name="description" error={error.description}>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="What does your module do? Who is it for?"
          maxLength={500}
          value={description}
          onChange={(e) => {
            // Keep value capped at 500 even for large paste operations.
            const nextValue = e.currentTarget.value.slice(0, 500);
            if (nextValue !== e.currentTarget.value) {
              e.currentTarget.value = nextValue;
            }
            setDescription(nextValue);
          }}
          aria-describedby="description-counter"
          className={inputClass}
        />

        <div className="mt-1 flex min-h-4 items-center justify-between text-xs">
          <span className="text-muted-foreground">Max 500 characters</span>
          <span
            id="description-counter"
            className={descriptionCounterClass}
            aria-live="polite"
          >
            {descriptionLength} / 500
          </span>
        </div>
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
        <p className="text-sm text-destructive">{error._.join(", ")}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? "Submitting…" : "Submit Module"}
      </button>
    </form>
  );
}

const inputClass =
  "input-base input-sm";

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
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error.join(", ")}</p>}
    </div>
  );
}
