import PostForm from "@/app/components/post/PostForm";

export default function NewPostPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      <PostForm />
    </div>
  );
}
