import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/app/store/authStore';

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ,
});

// Attach the token to every request except auth endpoints
API.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.includes('/api/auth/login/') || config.url?.includes('/api/auth/register/') || config.url?.includes('/api/auth/token/refresh/');
  const token = Cookies.get('session_access_token');
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`Added Authorization header for ${config.url}: Bearer ${token.slice(0, 10)}...`);
  } else if (isAuthEndpoint && token) {
    console.log(`Skipping Authorization header for auth endpoint: ${config.url}`);
  } else {
    console.warn(`No session_access_token found for: ${config.url}`);
  }
  return config;
});

// Handle 401 errors by refreshing the token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log(`Retrying request to ${originalRequest.url} with new token`);
        return API(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (data: { username: string; password: string }) => {
  try {
    const response = await API.post('/api/auth/login/', data);
    const { access, refresh, user } = response.data;
    Cookies.set('session_access_token', access, { expires: 1 });
    Cookies.set('session_refresh_token', refresh, { expires: 7 });
    console.log('Login successful, token stored:', access.slice(0, 10) + '...', 'user:', user);
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error);
    throw error;
  }
};

export const registerUser = async (data: { username: string; password: string; email: string }) => {
  try {
    const response = await API.post('/api/auth/register/', data);
    const { access, refresh, user } = response.data;
    Cookies.set('session_access_token', access, { expires: 1 });
    Cookies.set('session_refresh_token', refresh, { expires: 7 });
    console.log('Registration successful, token stored:', access.slice(0, 10) + '...', 'user:', user);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = Cookies.get('session_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await API.post('/api/auth/token/refresh/', { refresh: refreshToken });
    const { access } = response.data;
    Cookies.set('session_access_token', access, { expires: 1 });
    console.log('Token refreshed:', access.slice(0, 10) + '...');
    return access;
  } catch (error: any) {
    console.error('Token refresh error:', error.response?.data || error);
    throw error;
  }
};

export const fetchMe = async () => {
  try {
    const res = await API.get('/api/auth/me/');
    console.log('Fetched user data:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Fetch me error:', error.response?.data || error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, formData: FormData) => {
  try {
    console.log('Sending update request for user:', userId);
    const res = await API.patch(`/api/users/${userId}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    console.error('Profile update error:', error.response?.data || error);
    throw error;
  }
};