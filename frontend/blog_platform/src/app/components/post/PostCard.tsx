'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { togglePostLike, getPostLikes } from '@/app/lib/api/like';
import { getPostComments } from '@/app/lib/api/comments';
import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import CommentList from '@/app/components/comment/CommentList';
import CommentForm from '@/app/components/comment/CommentForm';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    user: { id: string; username: string; email: string; bio?: string; avatar?: string };
    created_at: string;
    updated_at: string;
    images?: { image: string }[];
    tags?: { name: string }[];
    likes?: { id: string; user: { id: string; username: string; email: string; bio?: string; avatar?: string }; content_type: string; object_id: string; created_at: string }[];
    like_count?: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [likes, setLikes] = useState(post.likes);
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => {
      if (postRef.current) {
        observer.unobserve(postRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const fetchLikesAndComments = async () => {
      try {
        if (!likes) {
          const fetchedLikes = await getPostLikes(post.id);
          setLikes(fetchedLikes);
          setLikeCount(fetchedLikes.length);
          if (user) {
            const userHasLiked = fetchedLikes.some((like) => like.user.id === user.id);
            setIsLiked(userHasLiked);
          }
        }

        const fetchedComments = await getPostComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error(`Failed to fetch data for post ${post.id}:`, error);
      }
    };

    fetchLikesAndComments();
  }, [isVisible, post.id, user, likes]);

  useEffect(() => {
    if (user && likes) {
      const userHasLiked = likes.some((like) => like.user.id === user.id);
      setIsLiked(userHasLiked);
      setLikeCount(likes.length);
    }
  }, [user, likes]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const result = await togglePostLike(post.id);
      if (result.status === 'liked') {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        setLikes((prev) => [...(prev || []), { id: '', user, content_type: 'post', object_id: post.id, created_at: new Date().toISOString() }]);
      } else {
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
        setLikes((prev) => (prev || []).filter((like) => like.user.id !== user.id));
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentCreated = (newComment: any) => {
    if (!newComment.parent_id) {
      setComments((prev) => [...prev, newComment]);
    } else {
      const updateComments = (comments: any[], parentId: string, newComment: any): any[] => {
        return comments.map((comment) => {
          if (comment.id === parentId) {
            return { ...comment, children: [...(comment.children || []), newComment] };
          }
          if (comment.children && comment.children.length > 0) {
            return { ...comment, children: updateComments(comment.children, parentId, newComment) };
          }
          return comment;
        });
      };
      setComments((prev) => updateComments(prev, newComment.parent_id, newComment));
    }
  };

  return (
    <div ref={postRef} className="rounded-xl shadow p-4 bg-white">
      <div className="flex items-center space-x-3">
        {/* User Avatar - Make clickable to redirect to user's posts */}
        <div className="flex-shrink-0">
          <Link href={`/users/${post.user.id}`}>
            {post.user.avatar ? (
              <Image
                src={post.user.avatar}
                alt={`${post.user.username}'s avatar`}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                {post.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
        {/* Post Title */}
        <div className="flex-1">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-sm text-gray-500 mb-2">
            by <Link href={`/users/${post.user.id}`} className="text-blue-500 hover:underline">{post.user.username}</Link>
          </p>
        </div>
      </div>
      <p className="text-gray-700 mb-2">{post.content}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag, i) => (
            <span key={i} className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">
              {tag.name}
            </span>
          ))}
        </div>
      )}
     {post.images && post.images.length > 0 && (
  <div className="relative">
    <div
      ref={scrollContainerRef}
      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
    >
      {post.images.map((img, i) => (
        img.image ? (
          <div
            key={i}
            className="flex-shrink-0 snap-center w-full max-w-[600px] h-auto relative"
            style={{ aspectRatio: '4/3' }} // Adjust aspect ratio to better fit typical image proportions
          >
            <Image
              src={img.image}
              alt={`Post image ${i + 1}`}
              fill
              className="rounded-lg object-contain" // Changed to object-contain to show the full image
              onError={(e) => console.error(`Failed to load image: ${img.image}`)}
            />
          </div>
        ) : (
          <div
            key={i}
            className="flex-shrink-0 snap-center w-full max-w-[600px] h-[400px] rounded-lg bg-gray-200 flex items-center justify-center"
          >
            <span className="text-gray-500">Image unavailable</span>
          </div>
        )
      ))}
    </div>
    {post.images.length > 1 && (
      <>
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
        >
          ←
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
        >
          →
        </button>
      </>
    )}
  </div>
)}
      
      <div className="flex items-center space-x-4 mt-2">
        <button
          onClick={handleLikeToggle}
          className={`flex items-center space-x-1 focus:outline-none ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={isLiked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <button
          onClick={() => setIsCommentsVisible(!isCommentsVisible)}
          className="flex items-center space-x-1 text-gray-500 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </button>
      </div>
      {isCommentsVisible && (
        <div className="mt-4">
          <CommentForm postId={post.id} onCommentCreated={handleCommentCreated} />
          <CommentList comments={comments} onCommentCreated={handleCommentCreated} />
        </div>
      )}
    </div>
  );
}