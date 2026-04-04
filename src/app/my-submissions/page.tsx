import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
  PENDING: { 
    label: "Đang chờ duyệt", 
    style: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <ClockIcon />
  },
  APPROVED: { 
    label: "Đã phê duyệt", 
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckIcon />
  },
  REJECTED: { 
    label: "Bị từ chối", 
    style: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <XIcon />
  },
};

export default async function MySubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");
  const { submitted } = await searchParams;

  const submissions = await db.miniApp.findMany({
    where: { authorId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 py-4">
      {submitted === "1" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-6 py-4 text-sm text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="rounded-full bg-emerald-100 p-1.5 ring-4 ring-emerald-50">
            <CheckIcon />
          </div>
          <div>
            <p className="font-bold">Gửi module thành công!</p>
            <p className="text-emerald-700/80">Module của bạn đang chờ người quản trị kiểm duyệt.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bài nộp của tôi</h1>
          <p className="text-gray-500 font-medium">Theo dõi trạng thái và quản lý các module bạn đã đóng góp.</p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
        >
          + Gửi module mới
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/30 p-20 text-center">
          <div className="mb-6 rounded-full bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900">Bạn chưa có bài nộp nào</p>
          <p className="mt-2 text-gray-500">Hãy bắt đầu chia sẻ module đầu tiên của bạn ngay hôm nay!</p>
          <Link href="/submit" className="mt-8 font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Bắt đầu ngay →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub) => {
            const config = statusConfig[sub.status] || statusConfig.PENDING;
            return (
              <div
                key={sub.id}
                className="group relative flex flex-col gap-4 items-start justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-100 md:flex-row md:items-center"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {sub.name}
                    </h3>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {sub.category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon />
                      {new Date(sub.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {sub.feedback && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600 ring-1 ring-gray-100/50">
                      <FeedbackIcon />
                      <p><span className="font-bold">Phản hồi:</span> {sub.feedback}</p>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${config.style}`}>
                  {config.icon}
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}

function CalendarIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}

function FeedbackIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
