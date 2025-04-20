"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { toggleCommentLike, getCommentLikes } from "@/app/lib/api/comments";
import CommentForm from "./CommentForm";

interface CommentProps {
  comment: {
    id: string;
    post: string;
    user: { id: string; username: string; email: string; bio?: string; avatar?: string };
    text: string;
    parent_id?: string | null;
    created_at: string;
    children: CommentProps['comment'][];
    likes?: { id: string; user: { id: string; username: string; email: string; bio?: string; avatar?: string }; content_type: string; object_id: string; created_at: string }[];
    like_count?: number;
  };
  level: number;
  onCommentCreated: (comment: any) => void;
}

export default function Comment({ comment, level, onCommentCreated }: CommentProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count || 0);
  const [likes, setLikes] = useState(comment.likes || []);
  const [isReplying, setIsReplying] = useState(false);
  const [isRepliesVisible, setIsRepliesVisible] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const fetchedLikes = await getCommentLikes(comment.id);
        setLikes(fetchedLikes);
        setLikeCount(fetchedLikes.length);
        if (user) {
          const userHasLiked = fetchedLikes.some((like) => like.user.id === user.id);
          setIsLiked(userHasLiked);
        }
      } catch (error) {
        console.error(`Failed to fetch likes for comment ${comment.id}:`, error);
      }
    };

    if (!comment.likes) {
      fetchLikes();
    }
  }, [comment.id, comment.likes, user]);

  useEffect(() => {
    if (user && likes) {
      const userHasLiked = likes.some((like) => like.user.id === user.id);
      setIsLiked(userHasLiked);
      setLikeCount(likes.length);
    }
  }, [user, likes]);

  const handleLikeToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const result = await toggleCommentLike(comment.id);
      if (result.status === 'liked') {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        setLikes((prev) => [...prev, { id: '', user, content_type: 'comment', object_id: comment.id, created_at: new Date().toISOString() }]);
      } else {
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        setLikes((prev) => prev.filter((like) => like.user.id !== user.id));
      }
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
    }
  };

  // Placeholder for dislike functionality (not implemented in backend)
  const handleDislikeToggle = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Backend does not support dislike yet; this is a placeholder
    console.log("Dislike functionality not implemented");
  };

  // Function to format timestamp as relative time (e.g., "6 days ago")
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / secondsInDay);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  return (
    <div className={`ml-${level * 6} mt-2 flex space-x-3`}>
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {comment.user.avatar ? (
          <Image
            src={comment.user.avatar}
            alt={`${comment.user.username}'s avatar`}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            {comment.user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {/* Comment Content */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <Link href={`/users/${comment.user.id}`} className="text-sm font-semibold text-gray-800 hover:underline">
            @{comment.user.username}
          </Link>
          <span className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
        <div className="flex items-center space-x-3 mt-1">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none ${isLiked ? 'text-blue-500' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleDislikeToggle}
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span>0</span> {/* Placeholder for dislike count */}
          </button>
          {level < 3 && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-gray-500 hover:underline focus:outline-none"
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>
        {/* Replies Toggle */}
        {comment.children && comment.children.length > 0 && (
          <button
            onClick={() => setIsRepliesVisible(!isRepliesVisible)}
            className="flex items-center space-x-1 mt-2 text-xs text-blue-500 hover:underline focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transform ${isRepliesVisible ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span>
              {isRepliesVisible ? 'Hide' : 'Show'} {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
            </span>
          </button>
        )}
        {/* Reply Form */}
        {isReplying && level < 3 && (
          <div className={`mt-3 ml-${(level + 1) * 6}`}>
            <CommentForm
              postId={comment.post}
              parentId={comment.id}
              onCommentCreated={(newComment) => {
                onCommentCreated(newComment);
                setIsReplying(false);
              }}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}