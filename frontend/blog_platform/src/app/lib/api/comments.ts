import { API } from './auth';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface Comment {
  id: string;
  post: string;
  user: User;
  text: string;
  parent_id?: string | null;
  created_at: string;
  children: Comment[];
  likes?: { id: string; user: User; content_type: string; object_id: string; created_at: string }[];
  like_count?: number;
}

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    console.log(`API call: GET /api/posts/${postId}/comments/`);
    const res = await API.get(`/api/posts/${postId}/comments/`);
    if (!Array.isArray(res.data)) {
      throw new Error('Invalid response: Expected an array of comments');
    }
    return res.data;
  } catch (error: any) {
    console.error('Fetch post comments error:', error.response?.data || error.message || error);
    throw error;
  }
};

export const createComment = async (postId: string, text: string, parentId?: string): Promise<Comment> => {
  try {
    console.log(`API call: POST /api/posts/${postId}/comments/`);
    const data: { text: string; parent_id?: string } = { text };
    if (parentId) {
      data.parent_id = parentId;
    }
    const res = await API.post(`/api/posts/${postId}/comments/`, data);
    return res.data;
  } catch (error: any) {
    console.error('Create comment error:', error.response?.data || error);
    throw error;
  }
};

export const toggleCommentLike = async (commentId: string): Promise<{ status: 'liked' | 'unliked' }> => {
  try {
    console.log(`API call: POST /api/comments/${commentId}/like/`);
    const res = await API.post(`/api/comments/${commentId}/like/`);
    return res.data.status ? { status: res.data.status } : { status: 'liked' };
  } catch (error: any) {
    console.error('Toggle comment like error:', error.response?.data || error.message || error);
    throw error;
  }
};

export const getCommentLikes = async (commentId: string): Promise<{ id: string; user: User; content_type: string; object_id: string; created_at: string }[]> => {
  try {
    console.log(`API call: GET /api/comments/${commentId}/likes/`);
    const res = await API.get(`/api/comments/${commentId}/likes/`);
    if (!Array.isArray(res.data)) {
      throw new Error('Invalid response: Expected an array of likes');
    }
    return res.data;
  } catch (error: any) {
    console.error('Fetch comment likes error:', error.response?.data || error.message || error);
    throw error;
  }
};