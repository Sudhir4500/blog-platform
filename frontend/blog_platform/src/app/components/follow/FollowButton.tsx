'use client';

import { useState, useEffect } from 'react';
import { followUser, unfollowUser } from '@/app/lib/api/auth';
import { useAuthStore } from '@/app/store/authStore';
import { toast } from 'react-hot-toast';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange: () => void;
}

export default function FollowButton({ userId, isFollowing, onFollowChange }: FollowButtonProps) {
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  // Sync localIsFollowing with prop changes
  useEffect(() => {
    console.log('FollowButton: isFollowing prop updated:', isFollowing);
    setLocalIsFollowing(isFollowing);
  }, [isFollowing]);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }
    if (user.id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }
    setIsLoading(true);
    try {
      if (localIsFollowing) {
        const response = await unfollowUser(userId);
        setLocalIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        const response = await followUser(userId);
        setLocalIsFollowing(true);
        toast.success('Followed successfully');
      }
      onFollowChange(); // Trigger parent to refetch user data
    } catch (error: any) {
      console.error('Follow/Unfollow error:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading || user?.id === userId}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        localIsFollowing ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isLoading ? 'Loading...' : localIsFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}