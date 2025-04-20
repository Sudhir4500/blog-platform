import { API } from './auth';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface Tag {
  name: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  user: User;
  created_at: string;
  updated_at: string;
  images?: { image: string }[];
  tags?: Tag[];
  likes?: { id: string; user: User; content_type: string; object_id: string; created_at: string }[];
  like_count?: number;
}

export const getPosts = async (page = 1, limit = 10): Promise<Post[]> => {
  try {
    const res = await API.get(`/api/posts/?page=${page}&limit=${limit}`);
    const posts = res.data.results || res.data;
    if (!Array.isArray(posts)) {
      throw new Error("Invalid response: Expected an array of posts");
    }
    const postIds = posts.map((post: Post) => post.id);
    const uniqueIds = new Set(postIds);
    if (uniqueIds.size !== postIds.length) {
      console.warn(
        "Duplicate post IDs detected in API response for page",
        page,
        ":",
        postIds.filter((id: string, index: number) => postIds.indexOf(id) !== index)
      );
    }
    return posts;
  } catch (error: any) {
    console.error("Fetch posts error:", error.response?.data || error.message || error);
    throw error;
  }
};

export const createPost = async (formData: FormData): Promise<Post> => {
  try {
    console.log('Creating post at /api/posts/');
    const res = await API.post('/api/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    console.error('Create post error:', error.response?.data || error);
    throw error;
  }
};

export const updatePost = async (postId: string, formData: FormData): Promise<Post> => {
  try {
    console.log(`Updating post at /api/posts/${postId}/update/`);
    const res = await API.patch(`/api/posts/${postId}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    console.error('Update post error:', error.response?.data || error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    console.log(`Deleting post at /api/posts/${postId}/delete/`);
    await API.delete(`/api/posts/${postId}/delete/`);
  } catch (error: any) {
    console.error('Delete post error:', error.response?.data || error);
    throw error;
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  console.log('getUserPosts called with userId:', userId);
  if (!userId || userId === 'undefined') {
    console.log('Invalid user ID, throwing error');
    throw new Error('Invalid user ID');
  }
  try {
    console.log('Making API request to:', `/api/posts/user/${userId}/`);
    const res = await API.get(`/api/posts/user/${userId}/`);
    const posts = Array.isArray(res.data) ? res.data : res.data.posts || [];
    console.log('API response:', posts);
    if (!Array.isArray(posts)) {
      throw new Error('Invalid response: Expected an array of posts');
    }
    return posts;
  } catch (error: any) {
    console.error(`Fetch user posts error for user ${userId}:`, error.response?.data || error.message || error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const res = await API.get(`/api/users/${userId}/`);
    return res.data;
  } catch (error: any) {
    console.error(`Error fetching user ${userId}:`, error.response?.data || error.message || error);
    throw error;
  }
};