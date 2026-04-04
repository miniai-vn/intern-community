"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitModuleSchema } from "@/lib/validations";
import type { Category } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SubmitFormProps {
  categories: Category[];
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    repoUrl: "",
    demoUrl: "",
  });

  const NAME_MAX = 60;
  const DESCRIPTION_MAX = 500;

  const validateField = (name: string, value: string) => {
    const parsed = submitModuleSchema.safeParse({ ...formData, [name]: value });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors((prev) => ({
        ...prev,
        [name]: (fieldErrors as any)[name] || [],
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    
    // Mark all as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const parsed = submitModuleSchema.safeParse(formData);

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      // Scroll to first error
      const firstError = Object.keys(parsed.error.flatten().fieldErrors)[0];
      document.getElementById(firstError)?.focus();
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          setErrors(
            body?.error?.fieldErrors ?? {
              _: [typeof body?.error === "string" ? body.error : "Gửi không thành công. Vui lòng thử lại."],
            }
          );
          return;
        }

        router.push("/my-submissions?submitted=1");
        router.refresh();
      } catch {
        setErrors({ _: ["Lỗi mạng. Kiểm tra kết nối và thử lại."] });
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 transition-all hover:shadow-2xl hover:shadow-gray-300/50">
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Module Name */}
          <Field 
            label="Tên module" 
            name="name" 
            error={touched.name ? errors.name : undefined}
            className="md:col-span-2"
          >
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ví dụ: Pomodoro Timer"
              maxLength={NAME_MAX}
              value={formData.name}
              className={inputClass(!!(touched.name && errors.name))}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="mt-1.5 flex justify-end">
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400",
                formData.name.length >= NAME_MAX && "bg-red-50 text-red-500",
                formData.name.length >= NAME_MAX * 0.8 && formData.name.length < NAME_MAX && "bg-orange-50 text-orange-500"
              )}>
                {formData.name.length} / {NAME_MAX}
              </span>
            </div>
          </Field>

          {/* Category */}
          <Field 
            label="Danh mục" 
            name="categoryId" 
            error={touched.categoryId ? errors.categoryId : undefined}
          >
            <div className="relative">
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                className={cn(inputClass(!!(touched.categoryId && errors.categoryId)), "appearance-none")}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="" disabled>Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </Field>

          {/* GitHub URL */}
          <Field 
            label="Kho GitHub" 
            name="repoUrl" 
            error={touched.repoUrl ? errors.repoUrl : undefined}
          >
            <input
              id="repoUrl"
              name="repoUrl"
              type="url"
              placeholder="https://github.com/..."
              value={formData.repoUrl}
              className={inputClass(!!(touched.repoUrl && errors.repoUrl))}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Field>

          {/* Description */}
          <Field 
            label="Mô tả ngắn" 
            name="description" 
            error={touched.description ? errors.description : undefined}
            className="md:col-span-2"
          >
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Module làm gì? Giải quyết vấn đề nào?"
              maxLength={DESCRIPTION_MAX}
              value={formData.description}
              className={cn(inputClass(!!(touched.description && errors.description)), "resize-none")}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">Tối thiểu 20 ký tự</p>
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400",
                formData.description.length >= DESCRIPTION_MAX && "bg-red-50 text-red-500",
                formData.description.length >= DESCRIPTION_MAX * 0.9 && formData.description.length < DESCRIPTION_MAX && "bg-orange-50 text-orange-500"
              )}>
                {formData.description.length} / {DESCRIPTION_MAX}
              </span>
            </div>
          </Field>

          {/* Demo URL */}
          <Field 
            label="URL demo trực tiếp (tuỳ chọn)" 
            name="demoUrl" 
            error={touched.demoUrl ? errors.demoUrl : undefined}
            className="md:col-span-2"
          >
            <input
              id="demoUrl"
              name="demoUrl"
              type="url"
              placeholder="https://demo-cua-ban.vercel.app"
              value={formData.demoUrl}
              className={inputClass(!!(touched.demoUrl && errors.demoUrl))}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Field>
        </div>

        {/* Global Error Message */}
        {errors._ && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errors._.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100",
            isPending ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <div className="absolute inset-0 bg-white/20 transition-transform -translate-x-full group-hover:translate-x-full duration-700 ease-in-out" />
          <span className="relative flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang gửi...
              </>
            ) : (
              "Gửi module"
            )}
          </span>
        </button>
      </form>
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  cn(
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200",
    hasError 
      ? "border-red-500 bg-red-50/30 ring-1 ring-red-500 focus:border-red-500" 
      : "border-gray-200 bg-gray-50/30 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
  );

function Field({
  label,
  name,
  error,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
        {label}
        {error && (
          <span className="inline-flex animate-in fade-in slide-in-from-left-1 text-[11px] font-medium text-red-500">
            • {error[0]}
          </span>
        )}
      </label>
      <div className="relative group">
        {children}
      </div>
    </div>
  );
}
