import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ModuleCard } from "@/components/module-card";
import Link from "next/link";
import { Plus, ChevronDown } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const session = await auth();

  const modules = await db.miniApp.findMany({
    where: {
      status: "APPROVED",
      ...(category ? { category: { slug: category } } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { voteCount: "desc" },
    take: 12,
  });

  let votedIds = new Set<string>();
  if (session?.user) {
    const votes = await db.vote.findMany({
      where: {
        userId: session.user.id,
        moduleId: { in: modules.map((m) => m.id) },
      },
      select: { moduleId: true },
    });
    votedIds = new Set(votes.map((v) => v.moduleId));
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-12 space-y-10">
      {/* Hero Section */}
      <section className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Community Modules
        </h1>
        <p className="max-w-2xl text-base text-gray-500 leading-relaxed">
          A minimalist directory of curated engineering tools. Built for performance, designed for clarity.
        </p>
      </section>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${!category ? "bg-[#1d4ed8] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}${q ? `&q=${q}` : ''}`}
              className={`rounded-md px-3 py-1 text-xs font-semibold border transition-all ${category === c.slug
                ? "bg-[#1d4ed8] text-white border-[#1d4ed8]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Sort Dropdown tinh chỉnh theo Figma */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-wider uppercase">Sort By</span>
          <button className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            Most Recent <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Grid: Tăng gap-6 để các card không quá dính nhau */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-3">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} hasVoted={votedIds.has(m.id)} />
        ))}

        {!q && (
          <Link
            href="/submit"
            /* - bg-blue-50/50: Tạo lớp nền xanh nhạt đặc trưng của Figma.
               - border-gray-200: Viền xám nét đứt theo yêu cầu của bạn.
            */
            className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-[#F9F9FB] p-10 text-center transition-all hover:border-blue-300 hover:bg-blue-50/50"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>

            <h3 className="text-base font-bold text-gray-900">
              Build a Module
            </h3>

            <p className="mt-2 text-xs text-gray-500 max-w-[220px] leading-relaxed">
              Contribute to the ecosystem and showcase your engineering skills.
            </p>

            <span className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
              Get Started <span className="text-sm">→</span>
            </span>
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-[1440px] px-6 mt-32 border-t border-gray-100 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="max-w-md space-y-3 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#0F172A] leading-tight">Stay in the loop</h2>
            <p className="text-[#64748B] text-sm">No spam, just community updates and new module releases.</p>
          </div>

          <div className="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button className="bg-[#0F172A] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors whitespace-nowrap">
              Join Newsletter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}