'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // 🌟 Lấy thêm giá trị authorName từ Form
    const payload = {
      name: formData.get('name'),
      authorName: formData.get('authorName'), // 👈 Trường mới đây fen
      description: formData.get('description'),
      categorySlug: formData.get('category'),
      repoUrl: formData.get('repoUrl'),
    };

    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("🚀 Ngon lành! Module đã lên sóng Database.");
        window.location.href = "/"; 
      } else {
        const errorData = await res.json();
        alert(`❌ Lỗi rồi: ${errorData.error}`);
      }
    } catch (error) {
      alert("❌ Lỗi kết nối! Check lại Docker nhé Khánh.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="mx-auto max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="space-y-2">
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-blue-400 transition-colors">
            ← HỦY VÀ QUAY LẠI
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-white">Submit a Module</h1>
          <p className="text-gray-500 font-medium">Để lại tên tuổi của bạn trên hệ thống nhé!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 rounded-[40px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl shadow-2xl">
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tên Module */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Tên Module</label>
              <input name="name" required placeholder="Zalo Pay Plugin" className="w-full rounded-2xl border border-white/5 bg-white/5 p-5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
            </div>

            {/* Tên Tác Giả */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-blue-400 ml-1 font-bold">Author Name</label>
              <input name="authorName" required placeholder="Name Author.." className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-blue-100" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Category</label>
              <select name="category" className="w-full rounded-2xl border border-white/5 bg-[#121212] p-5 outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                <option value="ui">UI Components</option>
                <option value="logic">Logic / Hook</option>
                <option value="template">Template</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">GitHub URL</label>
              <input name="repoUrl" required placeholder="https://github.com/..." className="w-full rounded-2xl border border-white/5 bg-white/5 p-5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mô tả ngắn</label>
            <textarea name="description" required rows={4} placeholder="..." className="w-full rounded-2xl border border-white/5 bg-white/5 p-5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-white py-5 font-black text-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            <span className="uppercase tracking-widest text-sm">{isSubmitting ? "Đang xử lý..." : "Gửi Module Ngay"}</span>
            <span className="text-xl group-hover:rotate-12 transition-transform">🚀</span>
          </button>
        </form>
      </div>
    </div>
  );
}