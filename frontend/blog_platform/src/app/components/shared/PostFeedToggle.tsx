"use client";

import { Dispatch, SetStateAction } from "react";

interface PostFeedToggleProps {
  activeTab: "all" | "following";
  setActiveTab: Dispatch<SetStateAction<"all" | "following">>;
}

export default function PostFeedToggle({ activeTab, setActiveTab }: PostFeedToggleProps) {
  return (
    <div className="flex justify-center mb-6">
      <button
        className={`px-4 py-2 font-semibold rounded-l-lg ${activeTab === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        onClick={() => setActiveTab("all")}
      >
        All Posts
      </button>
      <button
        className={`px-4 py-2 font-semibold rounded-r-lg ${activeTab === "following" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
        onClick={() => setActiveTab("following")}
      >
        Following
      </button>
    </div>
  );
}