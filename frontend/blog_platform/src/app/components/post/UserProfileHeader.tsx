'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import { getUserById } from '@/app/lib/api/posts';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface Props {
  userId: string;
}

export default function UserProfileHeader({ userId }: Props) {
  const { user: currentUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(userId);
        setProfileUser(data);
      } catch (err) {
        console.error('Failed to load profile user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="text-center text-red-500 py-8">User not found.</div>;
  }

  const isOwner = currentUser?.id === profileUser.id;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-blue-500 hover:scale-105 transition-transform duration-300 shadow-lg">
        <Image
          src={profileUser.avatar || '/default-avatar.png'}
          alt={profileUser.username}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left w-full">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-gray-800">{profileUser.username}</h2>
          {isOwner && (
            <button
              onClick={() => router.push('/profile')}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Edit Profile
            </button>
          )}
        </div>
        {profileUser.bio && (
          <p className="mt-3 text-gray-600 text-base leading-relaxed">{profileUser.bio}</p>
        )}
      </div>
    </div>
  );
}
