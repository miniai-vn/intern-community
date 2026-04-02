import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canAuthorResubmit } from "@/lib/module-workflow";
import { ResubmitForm } from "@/components/resubmit-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditSubmissionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const { id } = await params;
  const miniApp = await db.miniApp.findFirst({
    where: { id, authorId: session.user.id },
  });

  if (!miniApp) {
    notFound();
  }

  if (!canAuthorResubmit(miniApp.status)) {
    redirect("/my-submissions");
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revise and Resubmit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your rejected submission and send it back for review.
        </p>
      </div>

      <ResubmitForm
        moduleId={miniApp.id}
        categories={categories}
        initialValues={{
          name: miniApp.name,
          description: miniApp.description,
          categoryId: miniApp.categoryId,
          repoUrl: miniApp.repoUrl,
          demoUrl: miniApp.demoUrl ?? "",
        }}
      />
    </div>
  );
}
