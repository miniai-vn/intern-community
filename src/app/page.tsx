import { db } from "@/lib/db";
import Link from "next/link";
import { ModuleCard } from "@/components/module-card";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Module {
  id: string;
  name: string;
  description: string;
  slug: string;
  voteCount: number;
  authorName: string;
  category: { name: string; slug: string; };
}

export default async function HomePage() {
  
  const modules = (await prisma.module.findMany({
    include: { 
      category: { select: { name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  })) as unknown as Module[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20 space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
              Intern <span className="text-blue-500"> Community Hub.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-lg leading-relaxed">
              Kho lưu trữ các mã nguồn mở.
            </p>
          </div>

          <Link 
            href="/submit" 
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
          >
            <span className="relative z-10 uppercase tracking-wider text-sm">Tạo Module mới</span>
            <span className="text-2xl group-hover:rotate-12 transition-transform">+</span>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 border-b border-white/5 pb-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {modules.length} Modules Online
          </div>
          <div className="hidden md:block h-1 w-1 rounded-full bg-gray-800"></div>
          <div className="hidden md:block text-xs font-bold text-gray-600 uppercase tracking-widest">
            Last update: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        {/* Grid Danh sách Module */}
        {modules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => (
              <div 
                key={module.id} 
                className="animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* ModuleCard nhận data thật từ DB */}
                <ModuleCard module={module} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[50px] bg-white/[0.02]">
            <div className="text-5xl mb-6 opacity-30">📦</div>
            <p className="text-gray-500 text-xl font-semibold">
              Chưa có module nào trong Database.
            </p>
            <p className="text-gray-600 mt-2">
              Hãy nhấn nút <Link href="/submit" className="text-blue-500 hover:underline">Tạo Module mới</Link>
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-10 text-center">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
          © 2026 Testing <span className="text-gray-400">Internship at MiniAI</span>
        </p>
      </footer>
    </div>
  );
}