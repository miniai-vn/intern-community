"use client";

import type { MiniApp, Category } from "@prisma/client";
import { SubmissionsList } from "@/components/submissions-list";
import { ToastContainer, useToast } from "@/components/toast";

interface SubmissionsPageClientProps {
  initialSubmissions: (MiniApp & { category: Category })[];
}

export function SubmissionsPageClient({ initialSubmissions }: SubmissionsPageClientProps) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <SubmissionsList initialSubmissions={initialSubmissions} addToast={addToast} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
