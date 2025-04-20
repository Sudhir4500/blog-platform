// app/users/[userId]/page.tsx

import UserPostsClient from '@/app/components/post/UserPostsClient';

// export type PageProps = {
//   params: { userId: string };
// };

// export default async function UserPostsPage({ params }: PageProps) {
//   return <UserPostsClient userId={params.userId} />;
// }

export default async function UserPostsPage({params}:{
  params:Promise<{userId:string}>
})
{
  const {userId} = await params;
  return <UserPostsClient userId={userId} />;
}