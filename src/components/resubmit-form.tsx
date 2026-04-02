"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { moduleResubmitSchema } from "@/lib/validations";
import type { Category } from "@/types";

type ResubmitFormValues = {
  name: string;
  description: string;
  categoryId: string;
  repoUrl: string;
  demoUrl: string;
};

interface ResubmitFormProps {
  moduleId: string;
  categories: Category[];
  initialValues: ResubmitFormValues;
}

export function ResubmitForm({
  moduleId,
  categories,
  initialValues,
}: ResubmitFormProps) {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = moduleResubmitSchema.safeParse(data);

    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}/resubmit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error?.fieldErrors ?? { _: [body.error ?? "Resubmission failed."] });
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
          maxLength={60}
          defaultValue={initialValues.name}
          className={inputClass}
        />
      </Field>

      <Field label="Description" name="description" error={error.description}>
        <textarea
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={initialValues.description}
          className={inputClass}
        />
      </Field>

      <Field label="Category" name="categoryId" error={error.categoryId}>
        <select name="categoryId" className={inputClass} defaultValue={initialValues.categoryId}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="GitHub repository URL" name="repoUrl" error={error.repoUrl}>
        <input
          name="repoUrl"
          type="url"
          defaultValue={initialValues.repoUrl}
          className={inputClass}
        />
      </Field>

      <Field label="Demo URL (optional)" name="demoUrl" error={error.demoUrl}>
        <input
          name="demoUrl"
          type="url"
          defaultValue={initialValues.demoUrl}
          className={inputClass}
        />
      </Field>

      {error._ && <p className="text-sm text-red-600">{error._.join(", ")}</p>}

      <div className="flex gap-2">
        <Link
          href="/my-submissions"
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Resubmitting..." : "Save and Resubmit"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error.join(", ")}</p>}
    </div>
  );
}
