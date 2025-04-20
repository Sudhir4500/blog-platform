"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { createComment } from "@/app/lib/api/comments";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentCreated: (comment: any) => void;
  onCancel?: () => void;
}

export default function CommentForm({ postId, parentId, onCommentCreated, onCancel }: CommentFormProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!text.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const newComment = await createComment(postId, text, parentId);
      setText("");
      onCommentCreated(newComment);
      if (onCancel) onCancel();
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="flex space-x-2 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? "Posting..." : parentId ? "Post Reply" : "Post Comment"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}