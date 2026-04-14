"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitModuleSchema } from "@/lib/validations";
import type { Category } from "@/types";

interface SubmitFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    repoUrl: string;
    demoUrl: string;
  } | null;
}

export function SubmitForm({ categories, initialData = null }: SubmitFormProps) {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData);

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
      const url = isEditMode
        ? `/api/my-submissions/${initialData?.id}`
        : "/api/modules";

      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
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
          defaultValue={initialData?.name ?? ""}
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
          defaultValue={initialData?.description ?? ""}
        />
      </Field>

      <Field label="Category" name="categoryId" error={error.categoryId}>
        <select name="categoryId" className={inputClass} defaultValue={initialData?.categoryId ?? ""}>
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
          defaultValue={initialData?.repoUrl ?? ""}
        />
      </Field>

      <Field label="Demo URL (optional)" name="demoUrl" error={error.demoUrl}>
        <input
          name="demoUrl"
          type="url"
          placeholder="https://your-demo.vercel.app"
          className={inputClass}
          defaultValue={initialData?.demoUrl ?? ""}
        />
      </Field>

      {error._ && (
        <p className="text-sm text-red-600">{error._.join(", ")}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting
          ? isEditMode
            ? "Saving…"
            : "Submitting…"
          : isEditMode
            ? "Save Changes"
            : "Submit Module"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error.join(", ")}</p>}
    </div>
  );
}
