import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Submit a Module</h1>
        <p className="mt-2 text-indigo-100">
          Share your mini-app with the TD community.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <SubmitForm categories={categories} />
      </div>
    </div>
  );
}
