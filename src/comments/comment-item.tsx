"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Reply, CornerDownRight } from "lucide-react";
import { deleteComment } from "@/lib/comments";
import { CommentForm } from "./comment-form";

interface CommentItemProps {
  comment: any; 
  currentUserId?: string;
  isAdmin?: boolean;
  isReply?: boolean;
}

export function CommentItem({ comment, currentUserId, isAdmin, isReply = false }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Logic: Author of the comment OR Admin can delete
  const canDelete = currentUserId === comment.authorId || isAdmin;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setIsDeleting(true);
    const result = await deleteComment(comment.id);
    if (!result.success) {
      alert(result.error);
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group flex flex-col gap-2 py-4 ${isDeleting ? "opacity-30 pointer-events-none" : ""} ${isReply ? "ml-8 mt-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Simple Avatar fallback */}
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold uppercase shadow-sm">
            {comment.author.name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{comment.author.name}</p>
              {currentUserId === comment.authorId && (
                <span className="text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">You</span>
              )}
            </div>
            <p className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</p>
          </div>
        </div>

        {canDelete && (
          <button 
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-9">
        {comment.content}
      </p>

      <div className="pl-9 flex items-center gap-4 mt-1">
        {!isReply && (
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Reply size={12} /> {isReplying ? "Cancel" : "Reply"}
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-4 ml-9 animate-in slide-in-from-top-2 duration-300">
          <CommentForm 
            miniAppId={comment.miniAppId} 
            parentId={comment.id} 
            onSuccess={() => setIsReplying(false)}
            placeholder={`Replying to ${comment.author.name}...`}
          />
        </div>
      )}

      {/* RECURSION: Rendering nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-1">
          {comment.replies.map((reply: any) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              currentUserId={currentUserId} 
              isAdmin={isAdmin} 
              isReply={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
}