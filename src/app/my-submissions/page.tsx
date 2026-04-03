import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubmissionsList } from "./submissions-list"; // 👈 thêm dòng này

export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const submissions = await db.miniApp.findMany({
    where: { authorId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <Link
          href="/submit"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Submission
        </Link>
      </div>

      <SubmissionsList submissions={submissions} /> 
    </div>
  );
}