import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "@/components/submit-form";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ editId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const { editId } = await searchParams;

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  let initialData = null;

  if (editId) {
    const submission = await db.miniApp.findFirst({
      where: {
        id: editId,
        authorId: session.user.id,
      },
    });

    if (!submission) notFound();

    if (submission.status !== "PENDING") {
      redirect("/my-submissions");
    }

    initialData = {
      id: submission.id,
      name: submission.name,
      description: submission.description,
      categoryId: submission.categoryId,
      repoUrl: submission.repoUrl,
      demoUrl: submission.demoUrl ?? "",
    };
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{initialData ? "Edit Submission" : "Submit a Module"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {initialData
            ? "Update your pending submission before it is reviewed."
            : "Share your mini-app with the TD community. Submissions are reviewed by maintainers before being listed publicly."}
        </p>
      </div>
      <SubmitForm categories={categories} initialData={initialData} />
    </div>
  );
}
