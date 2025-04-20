"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { createPost } from "@/app/lib/api/posts";
import { useRouter } from "next/navigation";
import TagsInput from "./Tagsinput";

export default function PostForm() {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    // Add tags to formData if they exist
    if (tags.length > 0) {
      formData.append("tag_names", JSON.stringify(tags));
    }
    if (data.images?.length > 0) {
      Array.from(data.images).forEach((file: any) => {
        formData.append("images", file as File);
      });
    }

    try {
      await createPost(formData);
      reset();
      setTags([]); // Clear tags after successful submission
      router.push("/");
    } catch (err) {
      console.error("Post creation failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg"
    >
      <div>
        <input
          {...register("title", { required: true })}
          placeholder="Title"
          className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      <div>
        <textarea
          {...register("content", { required: true })}
          placeholder="What's on your mind?"
          rows={6}
          className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none"
        />
      </div>

      <div>
        <TagsInput tags={tags} setTags={setTags} />
      </div>

      <div>
        <input
          {...register("images")}
          type="file"
          accept="image/*"
          multiple
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-xl file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 transition duration-150"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold transition duration-200 ${
          isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
      >
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}