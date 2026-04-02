import Link from "next/link";

// 🌟 Định nghĩa Interface để hết đỏ lòm trong Component
interface ModuleProps {
  module: {
    id: string;
    name: string;
    description: string;
    slug: string;
    voteCount: number;
    authorName: string;
    category: {
      name: string;
      slug: string;
    };
  };
}

export function ModuleCard({ module }: ModuleProps) {
  return (
    // 🌟 TRỌNG TÂM: Đường dẫn phải khớp với thư mục /app/modules/[slug]
    <Link 
      href={`/modules/${module.slug}`} 
      className="group block relative h-full"
    >
      {/* Hiệu ứng Glow khi hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[32px] opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
      
      <div className="relative h-full flex flex-col p-8 rounded-[30px] bg-[#121212] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-2xl">
        
        {/* Category Tag */}
        <div className="mb-6 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
            {module.category.name}
          </span>
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs">
            <span>⭐</span>
            {module.voteCount}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
            {module.name}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-medium">
            {module.description}
          </p>
        </div>

        {/* Footer Card */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white">
              {module.authorName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-gray-400">
              {module.authorName}
            </span>
          </div>
          
          <div className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 font-bold text-sm">
            Chi tiết →
          </div>
        </div>
      </div>
    </Link>
  );
}