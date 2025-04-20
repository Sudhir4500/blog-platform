"use client";

import { useState } from "react";

interface TagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function TagsInput({ tags, setTags }: TagsInputProps) {
  const [tagInput, setTagInput] = useState("");

  // Handle adding a tag when Enter is pressed
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  // Handle removing a tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 text-blue-800 hover:text-red-600 focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleTagInputKeyDown}
        placeholder="Add a tag and press Enter..."
        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
      />
    </div>
  );
}