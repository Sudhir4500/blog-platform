"use client";

import { useState } from "react";
import Comment from "./Comment";

interface CommentListProps {
  comments: {
    id: string;
    post: string;
    user: { id: string; username: string; email: string; bio?: string; avatar?: string };
    text: string;
    parent_id?: string | null;
    created_at: string;
    children: CommentListProps['comments'];
    likes?: { id: string; user: { id: string; username: string; email: string; bio?: string; avatar?: string }; content_type: string; object_id: string; created_at: string }[];
    like_count?: number;
  }[];
  level?: number;
  onCommentCreated: (comment: any) => void;
  isVisible?: boolean;
}

export default function CommentList({ comments, level = 0, onCommentCreated, isVisible = true }: CommentListProps) {
  if (!isVisible) return null;

  return (
    <div className={level === 0 ? 'space-y-4' : 'space-y-2 mt-2'}>
      {comments.map((comment) => (
        <div key={comment.id}>
          <Comment comment={comment} level={level} onCommentCreated={onCommentCreated} />
          {comment.children && comment.children.length > 0 && (
            <CommentList
              comments={comment.children}
              level={level + 1}
              onCommentCreated={onCommentCreated}
              isVisible={comment.children.length > 0 && (level === 0 ? true : isVisible)}
            />
          )}
        </div>
      ))}
    </div>
  );
}