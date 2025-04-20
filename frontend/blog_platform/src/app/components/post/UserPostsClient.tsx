'use client';

import { useEffect, useState } from 'react';
import { PostList } from './PostList';
import { API } from '@/app/lib/api/auth';
import UserProfileHeader from './UserProfileHeader';

type Props = {
  userId: string;
};

const UserPostsClient = ({ userId }: Props) => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/api/users/${userId}/`);
        setUsername(res.data.username);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUsername('Unknown');
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <>
      <UserProfileHeader userId={userId} />
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">
              Posts by {username ? username : '...'}
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <PostList userId={userId} />
        </main>
      </div>
    </>
  );
};

export default UserPostsClient;
