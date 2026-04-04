"use client";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash, Edit2, Send, X, Check } from "lucide-react";
import { Session } from "next-auth";
;

interface ModuleCardProps {
  moduleId: string;
  comments: any[];
  isAdmin: boolean;
  session: Session| null;
}
export function CommentSection({ moduleId, comments,  isAdmin,session }: ModuleCardProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  
  // State cho việc sửa bình luận
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // --- HÀM GỌI API ---

  // 1. Thêm bình luận
const handleCreate = async () => {
    if (!content.trim()) return;
    setIsPending(true);
    
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: moduleId, content }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData?.error || "Không thể gửi bình luận");
      }
      toast.success("Comment has been sent!");
      setContent("");
      router.refresh();
    } catch (error: any) {
      console.log(error);
      toast.error("Error: " + error.message);
    } finally {
      setIsPending(false);
    }
  };

  // 2. Xóa bình luận
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa chứ?")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error deleting comment");
      }

      toast.success("Comment has been deleted!");
      router.refresh();
    } catch (error: any) {
      toast.error("Error deleting comment: " + error.message);
    }
  };

  // 3. Sửa bình luận
  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error updating comment");
      }
      toast.success("Comment has been updated!");
      
      router.refresh();
    } catch (error: any) {
      toast.error("Error updating comment: " + error.message);
    }finally{
      setEditingId(null);
    }
  };

  return (
    <div className="mt-10 space-y-6 border-t pt-8">
      <h3 className="text-lg font-bold">Bình luận ({comments.length})</h3>

      {/* FORM NHẬP BÌNH LUẬN */}
      {session?.user ? (
        <div className="flex gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết gì đó..."
            className="flex-1 rounded-lg border p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button 
            disabled={isPending}
            onClick={handleCreate}
            className="bg-blue-600 text-white p-3 rounded-lg self-end hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Đăng nhập để bình luận nhé Tín.</p>
      )}

      {/* DANH SÁCH BÌNH LUẬN */}
      <div className="divide-y">
        {comments.map((comment: any) => {
          const isOwner = session?.user?.id === comment.userId;
          const canAction = isOwner || isAdmin;
          const isEditing = editingId === comment.id;

          return (
            <div key={comment.id} className="group py-4 flex gap-3">
              <img src={comment.user.image} className="h-8 w-8 rounded-full" alt="avatar" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{comment.user.name}</span>
                  
                  {/* Nút 3 chấm / Hành động */}
                  {canAction && !isEditing && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="p-1 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 hover:text-red-600"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* NỘI DUNG BÌNH LUẬN */}
                {isEditing ? (
                  <div className="mt-2 flex gap-2">
                    <input 
                      className="flex-1 border rounded px-2 py-1 text-sm outline-blue-500"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(comment.id)} className="text-green-600"><Check size={16}/></button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={16}/></button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}