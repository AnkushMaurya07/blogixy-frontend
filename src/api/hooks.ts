import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../features/auth/hooks';
import { useDebouncedValue } from '../utils/useDebouncedValue';

import { apiClient } from './client';
import type {
  BlogPayload,
  BlogPost,
  FavoriteEntry,
  PaginatedHomeFeedResponse,
  RegisterPayload,
  UserProfile,
} from './types';

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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      username?: string;
      email?: string;
      profile_title?: string;
      bio?: string;
      avatar?: File | null;
    }) => {
      // Multipart PATCH is flaky in some browsers/network stacks; use JSON when no file upload.
      if (payload.avatar) {
        // eslint-disable-next-line no-console -- intentional debug trace
        console.log('[useUpdateProfile] POST multipart', {
          username: payload.username,
          email: payload.email,
          profile_title: payload.profile_title,
          bioLen: payload.bio?.length,
          avatar: `${payload.avatar.name} (${payload.avatar.size}b)`,
        });
        const fd = new FormData();
        if (payload.username !== undefined) fd.append('username', payload.username);
        if (payload.email !== undefined) fd.append('email', payload.email);
        if (payload.profile_title !== undefined) fd.append('profile_title', payload.profile_title ?? '');
        if (payload.bio !== undefined) fd.append('bio', payload.bio ?? '');
        fd.append('avatar', payload.avatar);
        const data = (await apiClient.post<UserProfile>('/auth/profile/', fd)).data;
        // eslint-disable-next-line no-console -- intentional debug trace
        console.log('[useUpdateProfile] multipart success', { id: data.id, username: data.username });
        return data;
      }
      const body: Record<string, string> = {};
      if (payload.username !== undefined) body.username = payload.username;
      if (payload.email !== undefined) body.email = payload.email;
      if (payload.profile_title !== undefined) body.profile_title = payload.profile_title ?? '';
      if (payload.bio !== undefined) body.bio = payload.bio ?? '';
      // eslint-disable-next-line no-console -- intentional debug trace
      console.log('[useUpdateProfile] POST JSON', body);
      const data = (await apiClient.post<UserProfile>('/auth/profile/', body)).data;
      // eslint-disable-next-line no-console -- intentional debug trace
      console.log('[useUpdateProfile] JSON success', { id: data.id, username: data.username });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-detail'] });
    },
  });
};

/** Checks username availability for profile / signup (`username` must match server rules). */
export const useUsernameAvailability = (draftUsername: string, currentUsername: string) => {
  const debounced = useDebouncedValue(draftUsername.trim(), 400);
  const needsCheck = debounced.length > 0 && debounced !== currentUsername;
  return useQuery({
    queryKey: ['username-check', debounced],
    queryFn: async () =>
      (await apiClient.get<{ available: boolean }>('/auth/username-check/', { params: { username: debounced } })).data,
    enabled: needsCheck,
    staleTime: 25_000,
  });
};

export const useBlogs = () =>
  useQuery({
    queryKey: ['blogs', 'legacy-list'],
    queryFn: async () =>
      (await apiClient.get<PaginatedHomeFeedResponse>('/blogs/', { params: { page: 1, page_size: 100 } })).data
        .results,
  });

const HOME_FEED_PAGE_SIZE = 10;
const EXPLORE_PAGE_SIZE = 10;

export type HomeFeedSection = 'all' | 'following' | 'discover';

export const useInfiniteHomeFeed = (opts: { section: HomeFeedSection; enabled?: boolean }) =>
  useInfiniteQuery({
    queryKey: ['blogs', 'home-feed', HOME_FEED_PAGE_SIZE, opts.section],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.get<PaginatedHomeFeedResponse>('/blogs/feed/', {
          params: {
            page: pageParam,
            page_size: HOME_FEED_PAGE_SIZE,
            section: opts.section,
          },
        })
      ).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: opts.enabled ?? true,
  });

export const useInfiniteExploreBlogs = (params: { search: string; sort: 'latest' | 'ranking' }) =>
  useInfiniteQuery({
    queryKey: ['blogs', 'explore', params.search, params.sort, EXPLORE_PAGE_SIZE],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.get<PaginatedHomeFeedResponse>('/blogs/', {
          params: {
            search: params.search || undefined,
            sort: params.sort,
            page: pageParam,
            page_size: EXPLORE_PAGE_SIZE,
          },
        })
      ).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
    staleTime: 20_000,
  });

export const useFavoriteBlogs = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['blogs', 'favorites'],
    queryFn: async () => (await apiClient.get('/blogs/favorites/')).data as FavoriteEntry[],
    enabled: Boolean(token),
    staleTime: 25_000,
    refetchOnWindowFocus: true,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => (await apiClient.post(`/blogs/${slug}/favorite-toggle/`)).data as { favorited: boolean },
    onSuccess: (_data, slug) => {
      queryClient.invalidateQueries({ queryKey: ['blogs', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'home-feed'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'explore'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'by-author'] });
      queryClient.invalidateQueries({ queryKey: ['blog-detail', slug] });
    },
  });
};

export const useUserBlogs = (authorId: number | undefined) =>
  useQuery({
    queryKey: ['blogs', 'by-author', authorId],
    queryFn: async () => (await apiClient.get('/blogs/', { params: { author: authorId } })).data as BlogPost[],
    enabled: typeof authorId === 'number' && authorId > 0,
    staleTime: 25_000,
  });

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BlogPayload) => (await apiClient.post('/blogs/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'home-feed'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
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

export const useSendBlogToUsers = () =>
  useMutation({
    mutationFn: async (payload: { slug: string; receiver_ids: number[]; content?: string }) =>
      (
        await apiClient.post(`/blogs/${payload.slug}/send/`, {
          receiver_ids: payload.receiver_ids,
          content: payload.content ?? '',
        })
      ).data,
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

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post('/notifications/mark-all-read/')).data,
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

export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => (await apiClient.post(`/auth/follows/${userId}/toggle/`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', 'home-feed'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    refetchInterval: 4000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { receiver: number; content: string; message_type?: 'text' | 'blog_share'; shared_blog?: number }) =>
      (await apiClient.post('/auth/messages/', payload)).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; content: string }) =>
      (await apiClient.patch(`/auth/messages/${payload.id}/`, { content: payload.content })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await apiClient.delete(`/auth/messages/${id}/`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useUserDetail = (userId?: number) => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: ['user-detail', userId],
    queryFn: async () => (await apiClient.get(`/auth/users/${userId}/`)).data,
    enabled: Boolean(token) && Boolean(userId),
  });
};

export const useAiGenerateDraft = () =>
  useMutation({
    mutationFn: async (payload: { prompt: string; tone?: string; length?: 'short' | 'medium' | 'long' }) =>
      (await apiClient.post('/ai/generate-draft/', payload)).data,
  });
