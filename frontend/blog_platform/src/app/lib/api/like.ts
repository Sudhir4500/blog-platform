import { API } from './auth';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface Like {
  id: string;
  user: User;
  content_type: string;
  object_id: string;
  created_at: string;
}

export const togglePostLike = async (postId: string): Promise<{ status: 'liked' | 'unliked' }> => {
  try {
    console.log(`API call: POST /api/posts/${postId}/like/`);
    const res = await API.post(`/api/posts/${postId}/like/`);
    return res.data.status ? { status: res.data.status } : { status: 'liked' };
  } catch (error: any) {
    console.error('Toggle post like error:', error.response?.data || error.message || error);
    throw error;
  }
};

export const getPostLikes = async (postId: string): Promise<Like[]> => {
  try {
    console.log(`API call: GET /api/posts/${postId}/likes/`);
    const res = await API.get(`/api/posts/${postId}/likes/`);
    if (!Array.isArray(res.data)) {
      throw new Error('Invalid response: Expected an array of likes');
    }
    return res.data;
  } catch (error: any) {
    console.error('Fetch post likes error:', error.response?.data || error.message || error);
    throw error;
  }
};

export const batchGetPostLikes = async (postIds: string[]): Promise<{ [postId: string]: Like[] }> => {
  try {
    console.log(`Batch fetching likes for ${postIds.length} posts:`, postIds);
    const likePromises = postIds.map(async (postId) => {
      const likes = await getPostLikes(postId);
      return { postId, likes };
    });
    const results = await Promise.all(likePromises);
    return results.reduce((acc, { postId, likes }) => {
      acc[postId] = likes;
      return acc;
    }, {} as { [postId: string]: Like[] });
  } catch (error: any) {
    console.error('Batch fetch post likes error:', error);
    throw error;
  }
};