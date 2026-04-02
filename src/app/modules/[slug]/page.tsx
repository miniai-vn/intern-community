import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VoteButton } from "@/components/vote-button";

// Luôn lấy dữ liệu mới nhất
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function ModuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Lấy data thật từ Postgres
  const module = await prisma.module.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!module) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 font-sans">
      <div className="mx-auto max-w-6xl p-8 md:p-20 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

        {/* Nút Quay Lại */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-400 transition-all group"
        >
          <span className="mr-2 transition-transform group-hover:-translate-x-2">←</span>
          QUAY LẠI DANH SÁCH
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div className="space-y-4">
            <div className="inline-block rounded-full bg-blue-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">
              {module.category.name}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white">
              {module.name}
            </h1>
            <p className="text-xl text-gray-400">
              Phát triển bởi <span className="text-white font-semibold underline decoration-blue-500/50 underline-offset-4">{module.authorName}</span>
            </p>
          </div>

          <div className="scale-125 origin-left md:origin-right pb-2">
            <VoteButton moduleId={module.id} initialCount={module.voteCount} />
          </div>
        </div>

        {/* Layout chia 2 */}
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* CỘT TRÁI: NỘI DUNG VỚI CĂN LỀ ĐỀU */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
                  Mô tả module
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed font-medium text-justify">
                  {module.description}
                </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-500 italic text-justify">
              "Module này được tối ưu hóa cho hiệu năng cao nhất và dễ dàng tích hợp vào các hệ sinh thái React/Next.js hiện đại bằng TypeScript."
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 mb-2">Tương tác</h2>
                <a
                  href={module.repoUrl || "#"}
                  target="_blank"
                  className="flex items-center justify-center gap-3 px-8 py-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-white transition-all shadow-xl active:scale-95 group"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  XEM GITHUB
                </a>
            </div>
          </div>

          {/* CỘT PHẢI: PREVIEW SECTION */}
          <div className="lg:col-span-7 sticky top-20">
            <div className="relative group">
              <div className="absolute -inset-1 bg-blue-500/20 rounded-[40px] blur-2xl group-hover:bg-blue-500/30 transition duration-1000"></div>
              
              <div className="relative rounded-[32px] border border-white/10 bg-[#0f0f0f] overflow-hidden shadow-2xl">
                <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                  </div>
                  <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Preview Mode</div>
                </div>

                <div className="aspect-video flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent">
                  {module.demoUrl ? (
                    <div className="space-y-6">
                      <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto border border-blue-500/20">
                        <span className="text-3xl">🚀</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white italic">Live Demo Ready</h3>
                        <p className="text-sm text-gray-500 max-w-[240px] mx-auto font-medium text-justify">Trải nghiệm trực tiếp tính năng của module thông qua môi trường sandbox do tác giả cung cấp.</p>
                      </div>
                      <a 
                        href={module.demoUrl} 
                        target="_blank"
                        className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                      >
                        Trải nghiệm ngay
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6 opacity-40">
                       <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 text-3xl">
                        🚧
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Sandbox Preview</h3>
                        <p className="text-sm text-gray-500 max-w-[240px] mx-auto text-justify">Môi trường chạy code trực tiếp (Runtime Preview) đang được hoàn thiện. Vui lòng tham khảo mã nguồn trên GitHub.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
                {['Tốc độ: 98/100', 'Size: 12kb', 'Type: TS Ready'].map((stat) => (
                    <div key={stat} className="py-3 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        {stat}
                    </div>
                ))}
            </div>
          </div>

        </div>

        <div className="mt-20 p-16 bg-white/[0.02] border border-white/10 rounded-[40px] text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl">🛠️</div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Internship Community Hub.</h3>
        </div>
      </div>
    </div>
  );
}