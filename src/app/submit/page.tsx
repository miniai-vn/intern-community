import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="relative z-10 mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Submit a Module</h1>
        <p className="mt-3 text-slate-300">
          Chia sẻ mini-app của bạn với TD community. Các submission sẽ được maintainer duyệt trước khi công bố.
        </p>
      </div>
      <SubmitForm categories={categories} />
    </div>
  );
}
