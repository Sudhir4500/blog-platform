'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { createPost } from '@/app/lib/api/posts';
import { useRouter } from 'next/navigation';
import TagsInput from './Tagsinput';
import Image from 'next/image';
import ImageReviewer from '../image/ImageReviewer';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  content: string;
  images?: FileList;
}

export default function PostForm() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const router = useRouter();

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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    tags.forEach((tag, index) => {
      formData.append(`tag_names[${index}]`, tag);
    });
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      await createPost(formData);
      reset();
      setTags([]);
      setImages([]);
      setImagePreviews([]);
      setSelectedImageIndex(null);
      router.push('/');
      toast.success('Post created successfully');
    } catch (err) {
      console.error('Post creation failed', err);
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up image previews to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg"
      >
        <div>
          <input
            {...register('title', { required: true })}
            placeholder="Title"
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            aria-required="true"
          />
        </div>

        <div>
          <textarea
            {...register('content', { required: true })}
            placeholder="What's on your mind?"
            rows={6}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg resize-none"
            aria-required="true"
          />
        </div>

        <div>
          <TagsInput tags={tags} setTags={setTags} />
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            Images (optional)
          </label>
          <input
            {...register('images')}
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 transition duration-150"
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

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold transition duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>

      {selectedImageIndex !== null && (
        <ImageReviewer
          images={imagePreviews}
          initialIndex={selectedImageIndex}
          onClose={closeImageReviewer}
          imageNames={images.map((img) => img.name)}
        />
      )}
    </>
  );
}