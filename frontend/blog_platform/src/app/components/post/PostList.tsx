'use client';

import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { getUserPosts } from '@/app/lib/api/posts';

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
}

export const PostList: React.FC<PostListProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="text-center text-gray-600">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.length === 0 ? (
        <p className="text-center col-span-full text-gray-600">No posts found for this user.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};