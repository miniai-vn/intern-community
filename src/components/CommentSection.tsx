"use client";

import { useSession } from "next-auth/react";
import { createComment } from "@/app/actions/comment";

// Define the expected shape of the comment data coming from the server
type CommentProps = {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string | null;
  user: { name: string | null } | null;
};

export default function CommentSection({ 
  miniAppId, 
  initialComments 
}: { 
  miniAppId: string; 
  initialComments: CommentProps[] 
}) {
  const { data: session } = useSession();

  return (
    <div className="mt-10 space-y-8">
      <h3 className="text-2xl font-bold text-gray-900">Comments</h3>

     {/* Comment Form */}
<form action={createComment} className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
  <input type="hidden" name="miniAppId" value={miniAppId} />

  {!session && (
    <div>
      <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
        Display Name (Optional)
      </label>
      <input
        type="text"
        name="authorName"
        id="authorName"
        placeholder="Anonymous"
        className="block w-full sm:text-sm rounded-md border-gray-300 border p-2"
      />
    </div>
  )}

  <textarea
    name="content"
    required
    rows={3}
    className="block w-full sm:text-sm rounded-md border-gray-300 border p-3"
    placeholder="What are your thoughts?"
  />

  <div className="flex justify-end">
    <button
      type="submit"
      className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium"
    >
      Post Comment
    </button>
  </div>
</form>
      

      {/* Comments List */}
      <div className="space-y-4">
        {initialComments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          initialComments.map((comment) => (
            <div key={comment.id} className="p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex items-center space-x-2 text-sm mb-2">
                <span className="font-bold text-gray-900">
                  {comment.user?.name || comment.authorName || "Anonymous"}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric' 
                  })}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}