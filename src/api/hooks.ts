import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { BlogPayload, RegisterPayload } from './types';

export const useRegister = () =>
  useMutation({
    mutationFn: async (payload: RegisterPayload) => (await apiClient.post('/auth/register/', payload)).data,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload: { username: string; password: string }) =>
      (await apiClient.post('/auth/login/', payload)).data,
  });

export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await apiClient.get('/auth/profile/')).data,
  });

export const useBlogs = () =>
  useQuery({
    queryKey: ['blogs'],
    queryFn: async () => (await apiClient.get('/blogs/')).data,
  });

export const useExploreBlogs = (params: { search: string; sort: 'latest' | 'ranking' }) =>
  useQuery({
    queryKey: ['blogs', 'explore', params],
    queryFn: async () =>
      (
        await apiClient.get('/blogs/', {
          params: { search: params.search || undefined, sort: params.sort },
        })
      ).data,
  });

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BlogPayload) => (await apiClient.post('/blogs/', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogs'] }),
  });
};

export const useUploadBlogMedia = () =>
  useMutation({
    mutationFn: async (payload: { blogId: number; file: File; mediaType: 'image' | 'video' }) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('media_type', payload.mediaType);
      return (
        await apiClient.post(`/blogs/${payload.blogId}/media/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      ).data;
    },
  });

export const useCreateShareLink = () =>
  useMutation({
    mutationFn: async (slug: string) => (await apiClient.post(`/blogs/${slug}/share/`)).data,
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/notifications/')).data,
  });

export const useBlogComments = (slug: string) =>
  useQuery({
    queryKey: ['blog-comments', slug],
    queryFn: async () => (await apiClient.get(`/blogs/${slug}/comments/`)).data,
    enabled: Boolean(slug),
  });

export const useCreateComment = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => (await apiClient.post(`/blogs/${slug}/comments/`, { content })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog-comments', slug] }),
  });
};

export const useToggleLike = () =>
  useMutation({
    mutationFn: async (slug: string) => (await apiClient.post(`/blogs/${slug}/like-toggle/`)).data,
  });

export const useAnalytics = () =>
  useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await apiClient.get('/blogs/analytics/')).data,
  });

export const useUsers = (search: string) =>
  useQuery({
    queryKey: ['users', search],
    queryFn: async () => (await apiClient.get('/auth/users/', { params: { search: search || undefined } })).data,
  });

export const useFollowUser = () =>
  useMutation({
    mutationFn: async (following: number) => (await apiClient.post('/auth/follows/create/', { following })).data,
  });

export const useMessages = (withUser?: number) =>
  useQuery({
    queryKey: ['messages', withUser],
    queryFn: async () =>
      (await apiClient.get('/auth/messages/', { params: { with_user: withUser || undefined } })).data,
  });

export const useSendMessage = () =>
  useMutation({
    mutationFn: async (payload: { receiver: number; content: string }) =>
      (await apiClient.post('/auth/messages/', payload)).data,
  });
