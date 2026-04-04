"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, X, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

export function CategoryList({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();

  // Quan trọng: Khởi tạo state bằng mảng initialCategories
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");

  // Logic gọi API khi search
  // Logic gọi API khi search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCategories(initialCategories);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/category?q=${encodeURIComponent(searchQuery)}`,
        );
        if (!res.ok) {
          const errorData = await res.json();
          console.log("Error creating comment:", errorData.error);
          throw new Error(errorData?.error || "Không thể gửi bình luận");
        }
        const json = await res.json();

        const results = json.data?.items;
       
        if (Array.isArray(results)) {
          setCategories(results);
        } else {
          setCategories([]);
        }
      } catch (error: any) {
        toast.error("Search error:", error.message);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, initialCategories]);
  // Các hàm Handle (Thêm/Sửa/Xóa) giữ nguyên nhưng dùng router.refresh()
  const openModal = (cat?: Category) => {
    if (cat) {
      setEditId(cat.id);
      setName(cat.name);
    } else {
      setEditId(null);
      setName("");
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsPending(true);

    try {
      const url = editId ? `/api/category/${editId}` : "/api/category";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "");
      }
      toast.success(editId ? "Sucess edit category" : "Sucess create category");
      setIsOpen(false);
      setSearchQuery(""); // Reset search để thấy item mới update
      router.refresh();
    }catch(error: any){
      toast.error(editId ? "Error edit category" : "Error create category"+error.message);
    }
     finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Xóa thư mục nhá?")) return;
      const res = await fetch(`/api/category/${id}`, { method: "DELETE" });
      if (!res.ok){
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting category");
      }
      toast.success("category has been deleted!");
        router.refresh();
    } catch (error: any) {
      toast.error("Error deleting category: " + error.message);
    }
    
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="Tìm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>

        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="grid gap-3">
        {/* Đảm bảo categories luôn là Array trước khi map */}
        {Array.isArray(categories) &&
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md transition group"
            >
              <div>
                <h3 className="font-bold text-gray-800">{cat.name}</h3>
                <p className="text-[10px] text-gray-400 uppercase">
                  ID: {cat.id}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(cat)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

        {categories.length === 0 && !isSearching && (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl text-gray-400">
            Không tìm thấy danh mục nào.
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editId ? "Update" : "Create"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={isPending}
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl"
                >
                  {isPending ? "..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
