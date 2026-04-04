import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8 py-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 px-6 py-10 text-center text-white shadow-xl sm:py-12">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            Gửi{" "}
            <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
              module
            </span>{" "}
            của bạn
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
            Chia sẻ mini-app với cộng đồng TD. Bài gửi sẽ được người quản trị duyệt trước khi
            hiển thị công khai trên trang chủ.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <SubmitForm categories={categories} />
      </div>
    </div>
  );
}
