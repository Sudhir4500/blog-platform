import { API } from './api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  user: User;
  created_at: string;
  updated_at: string;
  images?: { image: string }[];
  tags?: { name: string }[];
  likes?: { id: string; user: User; content_type: string; object_id: string; created_at: string }[];
  like_count?: number;
}

export const searchPostsByTags = async (tags: string): Promise<Post[]> => {
  try {
    console.log(`API call: GET /api/posts/search/?tags=${tags}`);
    const res = await API.get(`/api/posts/search/`, {
      params: { tags },
    });
    if (!Array.isArray(res.data)) {
      console.warn('searchPostsByTags: Response data is not an array:', res.data);
      return [];
    }
    return res.data;
  } catch (error: any) {
    console.error('Search posts error:', error.response?.data || error.message || error);
    return [];
  }
};

export const searchProfiles = async (query: string): Promise<User[]> => {
  try {
    if (!query.trim()) {
      console.warn('searchProfiles: Empty query provided');
      return [];
    }
    console.log(`API call: GET /api/users/search/?query=${query}`);
    const res = await API.get(`/api/users/search/`, {
      params: { query },
    });
    if (!Array.isArray(res.data)) {
      console.warn('searchProfiles: Response data is not an array:', res.data);
      return [];
    }
    return res.data;
  } catch (error: any) {
    console.error('Search profiles error:', error.response?.data || error.message || error);
    return [];
  }
};