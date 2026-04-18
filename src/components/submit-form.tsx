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

  const [desc, setDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900/40 p-8 backdrop-blur-sm shadow-xl">
      <Field label="Module name" name="name" error={error.name}>
        <input
          name="name"
          type="text"
          placeholder="e.g. Pomodoro Timer"
          maxLength={60}
          className={`${inputClass} pr-12`}
        />
      </Field>

      <Field label="Description" name="description" error={error.description} hint="Max 500 characters">
        <div className="relative group">
          <textarea
            name="description"
            rows={4}
            placeholder="What does your module do? Who is it for?"
            maxLength={500}
            className={`${inputClass} resize-none pr-12`}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <p className={`absolute bottom-3 right-3 text-[10px] font-mono transition-colors ${desc.length >= 450 ? "text-red-500" : "text-gray-500 group-focus-within:text-blue-400"}`}>
            {desc.length} / 500
          </p>
        </div>
      </Field>

      <Field label="Category" name="categoryId" error={error.categoryId}>
        <select
          name="categoryId"
          onChange={(e) => setCategoryId(e.target.value)}
          className={`${inputClass} appearance-none cursor-pointer ${categoryId ? "text-gray-100" : "text-gray-500"}`}
          defaultValue=""
        >
          <option value="" disabled className="bg-gray-900">Select a category</option>
          {categories.map((c) => (
            <option className="bg-gray-900 text-gray-100" key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="GitHub repository URL" name="repoUrl" error={error.repoUrl}>
          <input
            name="repoUrl"
            type="url"
            placeholder="https://github.com/..."
            className={inputClass}
          />
        </Field>

        <Field label="Demo URL (optional)" name="demoUrl" error={error.demoUrl}>
          <input
            name="demoUrl"
            type="url"
            placeholder="https://your-demo.com"
            className={inputClass}
          />
        </Field>
      </div>

      {error._ && (
        <p className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20 text-center">
          ⚠️ {error._.join(", ")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] disabled:opacity-50 active:scale-[0.98]"
      >
        <span className="relative z-10">
          {isSubmitting ? "Processing..." : "Submit Module"}
        </span>
        {/* Hiệu ứng tia sáng chạy qua khi hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    </form>
  );
}

const inputClass = `
  w-full rounded-xl border border-gray-800 bg-gray-950/50 px-4 py-2.5 text-sm text-gray-100 
  placeholder:text-gray-600 outline-none transition-all
  hover:border-gray-700 hover:bg-gray-950
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-950
`;
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
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </label>
      {children}
      <div className="flex justify-between px-1">
        {hint && <p className="text-[11px] text-gray-500 italic">{hint}</p>}
        {error && <p className="text-[11px] text-red-400 font-medium">✕ {error.join(", ")}</p>}
      </div>
    </div>
  );
}
