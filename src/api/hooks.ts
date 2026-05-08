import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../features/auth/hooks';

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

export const useProfile = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await apiClient.get('/auth/profile/')).data,
    enabled: Boolean(token),
  });
};

export const useBlogs = () =>
  useQuery({
    queryKey: ['blogs'],
    queryFn: async () => (await apiClient.get('/blogs/')).data,
  });

export const useHomeFeed = () =>
  useQuery({
    queryKey: ['blogs', 'home-feed'],
    queryFn: async () => (await apiClient.get('/blogs/feed/')).data,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
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
    staleTime: 20_000,
  });

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BlogPayload) => (await apiClient.post('/blogs/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'home-feed'] });
    },
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

export const useNotifications = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/notifications/')).data,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    enabled: Boolean(token),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: number) =>
      (await apiClient.patch(`/notifications/${notificationId}/`, { is_read: true })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

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

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => (await apiClient.post(`/blogs/${slug}/like-toggle/`)).data,
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ['blogs', 'explore'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', slug] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'home-feed'] });
    },
  });
};

export const useAnalytics = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await apiClient.get('/blogs/analytics/')).data,
    enabled: Boolean(token),
  });
};

export const useUsers = (search: string) =>
  useQuery({
    queryKey: ['users', search],
    queryFn: async () => (await apiClient.get('/auth/users/', { params: { search: search || undefined } })).data,
  });

export const useSuggestedUsers = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['suggested-users'],
    queryFn: async () => (await apiClient.get('/auth/users/suggestions/')).data,
    staleTime: 120_000,
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
  });
};

export const useConversations = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await apiClient.get('/auth/messages/conversations/')).data,
    staleTime: 30_000,
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (following: number) => (await apiClient.post('/auth/follows/create/', { following })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'home-feed'] });
    },
  });
};

export const useMessages = (withUser?: number) => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['messages', withUser],
    queryFn: async () =>
      (await apiClient.get('/auth/messages/', { params: { with_user: withUser || undefined } })).data,
    enabled: Boolean(token) && Boolean(withUser),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { receiver: number; content: string }) =>
      (await apiClient.post('/auth/messages/', payload)).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
