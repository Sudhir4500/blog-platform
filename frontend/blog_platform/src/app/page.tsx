"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { getPosts } from "@/app/lib/api/posts";
import { fetchMe } from "@/app/lib/api/auth";
import PostCard from "@/app/components/post/PostCard";
import FollowingPosts from "@/app/components/post/FollowingPosts";
import PostFeedToggle from "./components/shared/PostFeedToggle";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

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

export default function PostFeedPage() {
  const { user, login } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth state, user:", user, "token in cookies:", Cookies.get('session_access_token'));
      if (user === null && Cookies.get('session_access_token')) {
        try {
          const userData = await fetchMe();
          login(userData, Cookies.get('session_access_token')!);
          console.log("Fetched user data:", userData);
        } catch (error) {
          console.warn("Failed to fetch user, redirecting to login:", error);
          router.push("/login");
        }
      } else if (user === null) {
        console.warn("No user or token, redirecting to login");
        router.push("/login");
      }
      setIsAuthChecked(true);
    };

    checkAuth();
  }, [user, login, router]);

  useEffect(() => {
    if (!isAuthChecked || !user || activeTab !== "all") return;

    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPosts();
        setPosts(data);
        console.log("Posts fetched successfully:", data);
      } catch (error: any) {
        const message = error.response?.data?.detail || "Failed to fetch posts. Please try again.";
        setError(message);
        console.error("Error fetching posts:", error.response?.data || error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isAuthChecked, user, activeTab]);

  if (!isAuthChecked || !user) return null;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <PostFeedToggle activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "all" ? (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold my-4">Posts</h1>
          {error && <div className="text-red-500 text-center">{error}</div>}
          {isLoading ? (
            <p className="text-center text-gray-400">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400">No posts yet</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      ) : (
        <FollowingPosts />
      )}
    </div>
  );
}