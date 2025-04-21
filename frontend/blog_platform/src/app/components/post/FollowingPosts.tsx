"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { getFollowingPosts } from "@/app/lib/api/posts";
import PostCard from "@/app/components/post/PostCard";

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

export default function FollowingPosts() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchFollowingPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getFollowingPosts(1, 10); // Fetch first page with 10 posts
        setPosts(data);
        console.log("Following posts fetched successfully:", data);
      } catch (error: any) {
        const message = error.response?.data?.detail || "Failed to fetch following posts. Please try again.";
        setError(message);
        console.error("Error fetching following posts:", error.response?.data || error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowingPosts();
  }, [user]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Following</h2>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {isLoading ? (
        <p className="text-center text-gray-400">Loading following posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts from followed users</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}