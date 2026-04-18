import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-xl space-y-10 py-10">
      {/* Header Section */}
      <div className="relative space-y-3">
        {/* Hiệu ứng ánh sáng phía sau tiêu đề */}
        <div className="absolute -top-10 left-1/2 -z-10 h-32 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[80px]" />

        <h1 className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent">
          Submit a Module
        </h1>

        <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-gray-400">
          Share your mini-app with the <span className="text-blue-400 font-medium">TD community</span>.
          Submissions are reviewed by maintainers before being listed publicly.
        </p>

        {/* Dấu gạch trang trí nhỏ */}
        <div className="mx-auto h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 opacity-50" />
      </div>

      {/* Form Section */}
      <div className="relative group">
        {/* Viền sáng mờ chạy quanh Form (Glow effect) */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-gray-700/50 to-transparent opacity-50 blur-[1px] transition duration-500 group-hover:opacity-100" />

        <div className="relative shadow-2xl">
          <SubmitForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
