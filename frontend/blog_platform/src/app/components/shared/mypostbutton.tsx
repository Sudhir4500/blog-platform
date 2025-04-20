'use client';

import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';

export const MyPostsButton: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }
    router.push(`/users/${user.id}`); // Navigate to user's posts page
  }, [user, router]);

  if (!user) return null; // Optionally hide if user is not authenticated

  return (
    <button
      onClick={handleClick}
      className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600 hover:ring-2 ring-blue-300 transition-all cursor-pointer"
      title="Go to My Posts"
    >
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={`${user.username}'s avatar`}
          width={48}
          height={48}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="bg-gray-300 w-full h-full flex items-center justify-center text-white text-sm">
          {user.username[0].toUpperCase()}
        </div>
      )}
    </button>
  );
};
