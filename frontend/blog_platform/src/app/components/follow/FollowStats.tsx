'use client';

interface FollowStatsProps {
  followersCount: number;
  followingCount: number;
}

export default function FollowStats({ followersCount, followingCount }: FollowStatsProps) {
  return (
    <div className="flex space-x-4 mt-2">
      <span className="text-gray-800">
        <strong>{followersCount}</strong> Followers
      </span>
      <span className="text-gray-800">
        <strong>{followingCount}</strong> Following
      </span>
    </div>
  );
}