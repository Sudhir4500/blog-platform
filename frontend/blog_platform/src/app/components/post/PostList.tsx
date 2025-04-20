'use client';

import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import EditPostModal from './EditPostModal';
import { getUserPosts, deletePost } from '@/app/lib/api/posts';
import { useAuthStore } from '@/app/store/authStore';
import { toast } from 'react-hot-toast';

interface Post {
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
}

interface PostListProps {
  userId: string;
  isOwner?: boolean; // New prop to indicate if the viewer is the owner
}

export const PostList: React.FC<PostListProps> = ({ userId, isOwner = false }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const data = await getUserPosts(userId);
        setPosts(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch posts');
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  const handleEdit = (post: Post) => {
    setEditPost(post);
    setMenuOpenId(null);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((post) => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete post');
    } finally {
      setMenuOpenId(null);
    }
  };

  const handleUpdate = (updatedPost: Post) => {
    setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <p className="text-center col-span-full text-gray-600">No posts found for this user.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} />
              {isOwner && user?.id === post.user.id && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v.01M12 12v.01M12 18v.01"
                      />
                    </svg>
                  </button>
                  {menuOpenId === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleEdit(post)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {editPost && (
        <EditPostModal
          post={editPost}
          isOpen={!!editPost}
          onClose={() => setEditPost(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};