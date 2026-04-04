import { Box, Star, Eye } from "lucide-react";
import Link from "next/link";

export function ModuleCard({ module }: { module: any }) {

  return (
    <article className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Top row: Icon & Rating */}
      <div className="mb-5 flex items-center justify-between">
        <div className="rounded-lg bg-blue-50/80 p-1.5 text-blue-600">
          <Box size={20} />
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
          <Star size={14} fill="#1d4ed8" className="text-[#1d4ed8]" />
          <span>4.8</span> {/* Rating có thể thay bằng dữ liệu thực nếu có */}
        </div>
      </div>

      <Link href={`/modules/${module.slug}`}>
        <h3 className="mb-2 text-lg font-bold text-black leading-tight hover:text-blue-600 transition-colors">
          {module.name}
        </h3>
      </Link>

      <p className="mb-6 line-clamp-3 text-[13px] leading-relaxed text-gray-500">
        {module.description}
      </p>

      {/* Bottom row: Category & Stats */}
      <div className="mt-auto flex items-center justify-between">
        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
          {module.category.name}
        </span>

        {/* Phần view count mới, khớp 100% với Figma */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
          <Eye size={14} />
          {/* Ở đây bạn thay bằng dữ liệu lượt xem thực tế từ database, ví dụ `module.viewCount` */}
          <span>1.2k views</span>
        </div>
      </div>
    </article>
  );
}