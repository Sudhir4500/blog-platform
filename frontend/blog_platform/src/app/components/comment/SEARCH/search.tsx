"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchPostsByTags, searchProfiles } from "@/app/lib/search"; // Adjust the import path as necessary

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

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPosts([]);
      setProfiles([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Search posts by tags
      const postResults = await searchPostsByTags(searchQuery);
      setPosts(postResults);

      // Search profiles by username or email
      const profileResults = await searchProfiles(searchQuery);
      setProfiles(profileResults);

      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setPosts([]);
      setProfiles([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the search input
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={searchContainerRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts by tags or profiles by username/email..."
          className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onFocus={() => query.trim() && setShowResults(true)}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Posts Section */}
              {posts.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Posts</h3>
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="flex-shrink-0">
                        {post.user.avatar ? (
                          <Image
                            src={post.user.avatar}
                            alt={`${post.user.username}'s avatar`}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                            {post.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{post.title}</p>
                        <p className="text-xs text-gray-500">
                          by @{post.user.username} • Tags: {post.tags?.map((tag) => tag.name).join(", ") || "None"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Profiles Section */}
              {profiles.length > 0 && (
                <div className="p-2 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Profiles</h3>
                  {profiles.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/users/${profile.id}`}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="flex-shrink-0">
                        {profile.avatar ? (
                          <Image
                            src={profile.avatar}
                            alt={`${profile.username}'s avatar`}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                            {profile.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">@{profile.username}</p>
                        <p className="text-xs text-gray-500">{profile.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {posts.length === 0 && profiles.length === 0 && (
                <div className="p-4 text-center text-gray-500">No results found</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}