'use client';

import { useState, useEffect } from 'react';
import { updatePost } from '@/app/lib/api/posts';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ImageReviewer from '../image/ImageReviewer';
interface Post {
  id: string;
  title: string;
  content: string;
  user: { id: string; username: string; email: string; bio?: string; avatar?: string };
  created_at: string;
  updated_at: string;
  images?: { image: string }[];
  tags?: { name: string }[];
}

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPost: Post) => void;
}

export default function EditPostModal({ post, isOpen, onClose, onUpdate }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(post.tags?.map((tag) => tag.name) || []);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_TAGS = 10;

  useEffect(() => {
    if (isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags?.map((tag) => tag.name) || []);
      setTagInput('');
      setImages([]);
      setImagePreviews([]);
      setSelectedImageIndex(null);
    }
  }, [isOpen, post]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= MAX_TAGS) {
        toast.error(`Maximum ${MAX_TAGS} tags allowed`);
        return;
      }
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else if (selectedImageIndex !== null && index < selectedImageIndex) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const openImageReviewer = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageReviewer = () => {
    setSelectedImageIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    tags.forEach((tag, index) => {
      formData.append(`tag_names[${index}]`, tag);
    });
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const updatedPost = await updatePost(post.id, formData);
      toast.success('Post updated successfully');
      onUpdate(updatedPost);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up image previews to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-transparent"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white bg-opacity-90 rounded-lg p-6 w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Post</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-required="true"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  required
                  aria-required="true"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (press Enter to add, max {MAX_TAGS})
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type a tag and press Enter"
                  aria-describedby="tags-help"
                />
                <p id="tags-help" className="text-xs text-gray-500 mt-1">
                  Enter up to {MAX_TAGS} tags, one at a time.
                </p>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {tags.length >= MAX_TAGS && (
                  <p className="text-xs text-red-500 mt-1">Maximum tag limit reached</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Images (replaces existing images)
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 w-full text-gray-700"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative w-full h-24 group"
                        title={images[index].name}
                      >
                        <button
                          type="button"
                          onClick={() => openImageReviewer(index)}
                          className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`View image ${images[index].name}`}
                        >
                          <Image
                            src={preview}
                            alt={`Preview ${images[index].name}`}
                            fill
                            className="object-cover rounded"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                          aria-label={`Remove image ${images[index].name}`}
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {images[index].name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </form>
          </motion.div>
          {selectedImageIndex !== null && (
            <ImageReviewer
              images={imagePreviews}
              initialIndex={selectedImageIndex}
              onClose={closeImageReviewer}
              imageNames={images.map((img) => img.name)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}