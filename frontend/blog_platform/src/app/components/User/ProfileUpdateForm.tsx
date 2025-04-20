'use client';

import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/app/store/authStore';
import { updateUserProfile, fetchMe } from '@/app/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import ImageReviewer from '../image/ImageReviewer';

interface FormData {
  username: string;
  bio: string;
  avatar?: FileList;
}

export default function ProfileUpdateForm() {
  const { user, login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isReviewerOpen, setIsReviewerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const token = Cookies.get('session_access_token');
    if (!token) {
      console.error('Authentication token is missing.');
      return;
    }

    try {
      const updatedUser = await fetchMe();
      login(updatedUser, token);
    } catch (err) {
      console.error('Error fetching updated profile:', err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatar(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    setIsReviewerOpen(false);
  };

  const openImageReviewer = () => {
    setIsReviewerOpen(true);
  };

  const closeImageReviewer = () => {
    setIsReviewerOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      setErrorMessage('User ID is missing. Please log in again.');
      return;
    }

    const token = Cookies.get('session_access_token');
    if (!token) {
      setErrorMessage('Authentication token is missing. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('bio', data.bio);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const updatedUser = await updateUserProfile(user.id, formData);
      login(updatedUser, token);
      fetchUserProfile();
      console.log('✅ Profile updated successfully:', updatedUser);
      router.push('/profile');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update profile. Please try again.';
      setErrorMessage(message);
      console.error('❌ Error updating profile:', err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up avatar preview to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">Update Your Profile</h2>

      {errorMessage && (
        <div className="mb-4 text-sm text-red-500 text-center">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Username</label>
          <input
            {...register('username', { required: 'Username is required' })}
            placeholder="Enter username"
            defaultValue={user?.username}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">Bio</label>
          <textarea
            {...register('bio')}
            placeholder="Tell us about yourself"
            defaultValue={user?.bio}
            className="w-full px-4 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-gray-700 mb-1 font-medium">
            Profile Picture (optional)
          </label>
          <input
            {...register('avatar')}
            type="file"
            id="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full border rounded-xl p-2 text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150"
          />
          {avatarPreview && (
            <div className="mt-2">
              <div className="relative w-24 h-24 group" title={avatar?.name}>
                <button
                  type="button"
                  onClick={openImageReviewer}
                  className="w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`View profile picture ${avatar?.name}`}
                >
                  <Image
                    src={avatarPreview}
                    alt={`Preview ${avatar?.name}`}
                    fill
                    className="object-cover rounded"
                  />
                </button>
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                  aria-label={`Remove profile picture ${avatar?.name}`}
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 truncate mt-1">{avatar?.name}</p>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {isReviewerOpen && avatarPreview && (
        <ImageReviewer
          images={[avatarPreview]}
          initialIndex={0}
          onClose={closeImageReviewer}
          imageNames={[avatar?.name || 'Profile picture']}
        />
      )}
    </div>
  );
}