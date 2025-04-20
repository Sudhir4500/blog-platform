// lib/search.ts
import { API } from "./api/auth";


interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
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
        params: { tags }  // This is the more standard way to pass query params
      });
      if (!Array.isArray(res.data)) {
        return [];  // Return empty array instead of throwing error
      }
      return res.data;
    } catch (error: any) {
      console.error('Search posts error:', error.response?.data || error.message || error);
      return [];  // Return empty array on error
    }
  };
  
  export const searchProfiles = async (query: string): Promise<User[]> => {
    try {
      console.log(`API call: GET /api/users/search/?query=${query}`);
      const res = await API.get(`/api/users/search/`, {
        params: { query }  // Standard way to pass query params
      });
      if (!Array.isArray(res.data)) {
        return [];
      }
      return res.data;
    } catch (error: any) {
      console.error('Search profiles error:', error.response?.data || error.message || error);
      return [];
    }
  };