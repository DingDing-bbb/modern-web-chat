import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { User, Message, Conversation, AuthResponse } from '../types';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url && !config.url.includes('XTransformPort')) {
    config.params = {
      ...config.params,
      XTransformPort: '3001',
    };
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { username: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  validate: (token: string) => api.post('/auth/validate', { token }),
};

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  updateMe: (data: { username?: string; avatar?: string }) =>
    api.put<User>('/users/me', data),
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
};

export const chatApi = {
  getConversations: () => api.get<Conversation[]>('/chat/conversations'),
  getConversation: (id: string) => api.get<Conversation>(`/chat/conversations/${id}`),
  createConversation: (data: { name?: string; type: string; participantIds: string[] }) =>
    api.post<Conversation>('/chat/conversations', data),
  getMessages: (conversationId: string, limit?: number, offset?: number) =>
    api.get<Message[]>(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset, XTransformPort: '3001' },
    }),
  sendMessage: (data: { content: string; type?: string; conversationId: string }) =>
    api.post<Message>('/chat/messages', data),
  markAsRead: (conversationId: string) =>
    api.put(`/chat/conversations/${conversationId}/read`),
  deleteMessage: (messageId: string) => api.delete(`/chat/messages/${messageId}`),
};

export default api;
