import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../features/auth/hooks';
import { useDebouncedValue } from '../utils/useDebouncedValue';

import { apiClient } from './client';
import type {
  BlogAnalytics,
  BlogPayload,
  BlogPost,
  FavoriteEntry,
  PaginatedHomeFeedResponse,
  RegisterPayload,
  ShareLinkResponse,
  UserProfile,
} from './types';

export type HomeFeedSection = 'all' | 'following' | 'discover';

export const queryKeys = {
  profile: ['profile'] as const,
  usernameCheck: (username: string) => ['username-check', username] as const,
  userDetail: (userId?: number) => ['user-detail', userId] as const,
  notifications: ['notifications'] as const,
  analytics: ['analytics'] as const,
  suggestedUsers: ['suggested-users'] as const,
  conversations: ['conversations'] as const,
  users: {
    root: ['users'] as const,
    search: (search: string) => ['users', search] as const,
  },
  messages: {
    root: ['messages'] as const,
    chat: (withUser?: number) => ['messages', withUser] as const,
  },
  sharedBlog: (token: string) => ['shared-blog', token] as const,
  blogs: {
    root: ['blogs'] as const,
    all: ['blogs'] as const,
    legacyList: ['blogs', 'legacy-list'] as const,
    homeFeedRoot: ['blogs', 'home-feed'] as const,
    homeFeed: (pageSize: number, section: HomeFeedSection) => ['blogs', 'home-feed', pageSize, section] as const,
    exploreRoot: ['blogs', 'explore'] as const,
    explore: (search: string, sort: 'latest' | 'ranking', pageSize: number) =>
      ['blogs', 'explore', search, sort, pageSize] as const,
    favorites: ['blogs', 'favorites'] as const,
    byAuthorRoot: ['blogs', 'by-author'] as const,
    byAuthor: (authorId: number | undefined) => ['blogs', 'by-author', authorId] as const,
    drafts: ['blogs', 'drafts'] as const,
    detail: (slug: string) => ['blog-detail', slug] as const,
    comments: (slug: string) => ['blog-comments', slug] as const,
    detailComments: (slug: string) => ['blog-detail-comments', slug] as const,
  },
} as const;

const invalidateBlogLists = (queryClient: QueryClient, slug?: string) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.blogs.homeFeedRoot });
  queryClient.invalidateQueries({ queryKey: queryKeys.blogs.exploreRoot });
  queryClient.invalidateQueries({ queryKey: queryKeys.blogs.byAuthorRoot });
  queryClient.invalidateQueries({ queryKey: queryKeys.blogs.favorites });
  queryClient.invalidateQueries({ queryKey: queryKeys.blogs.drafts });
  if (slug) {
    queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(slug) });
  }
};

const invalidateUserLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.suggestedUsers });
  queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
};

const invalidateMessageLists = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.messages.root });
  queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
};

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
    queryKey: queryKeys.profile,
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
        const fd = new FormData();
        if (payload.username !== undefined) fd.append('username', payload.username);
        if (payload.email !== undefined) fd.append('email', payload.email);
        if (payload.profile_title !== undefined) fd.append('profile_title', payload.profile_title ?? '');
        if (payload.bio !== undefined) fd.append('bio', payload.bio ?? '');
        fd.append('avatar', payload.avatar);
        return (await apiClient.post<UserProfile>('/auth/profile/', fd)).data;
      }
      const body: Record<string, string> = {};
      if (payload.username !== undefined) body.username = payload.username;
      if (payload.email !== undefined) body.email = payload.email;
      if (payload.profile_title !== undefined) body.profile_title = payload.profile_title ?? '';
      if (payload.bio !== undefined) body.bio = payload.bio ?? '';
      return (await apiClient.post<UserProfile>('/auth/profile/', body)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.userDetail() });
    },
  });
};

/** Checks username availability for profile / signup (`username` must match server rules). */
export const useUsernameAvailability = (draftUsername: string, currentUsername: string) => {
  const debounced = useDebouncedValue(draftUsername.trim(), 400);
  const needsCheck = debounced.length > 0 && debounced !== currentUsername;
  return useQuery({
    queryKey: queryKeys.usernameCheck(debounced),
    queryFn: async () =>
      (await apiClient.get<{ available: boolean }>('/auth/username-check/', { params: { username: debounced } })).data,
    enabled: needsCheck,
    staleTime: 25_000,
  });
};

export const useBlogs = () =>
  useQuery({
    queryKey: queryKeys.blogs.legacyList,
    queryFn: async () =>
      (await apiClient.get<PaginatedHomeFeedResponse>('/blogs/', { params: { page: 1, page_size: 100 } })).data
        .results,
  });

const HOME_FEED_PAGE_SIZE = 10;
const EXPLORE_PAGE_SIZE = 10;

async function fetchExploreBlogsPage(pageParam: number, search: string, sort: 'latest' | 'ranking') {
  return (
    await apiClient.get<PaginatedHomeFeedResponse>('/blogs/', {
      params: {
        search: search || undefined,
        sort,
        page: pageParam,
        page_size: EXPLORE_PAGE_SIZE,
      },
    })
  ).data;
}

/** Warms the default Explore query + route chunk so first open feels instant. */
export function prefetchExploreDefault(queryClient: QueryClient) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.blogs.explore('', 'ranking', EXPLORE_PAGE_SIZE),
    queryFn: ({ pageParam }) => fetchExploreBlogsPage(Number(pageParam), '', 'ranking'),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedHomeFeedResponse) => (lastPage.has_next ? lastPage.page + 1 : undefined),
  });
}

export const useInfiniteHomeFeed = (opts: { section: HomeFeedSection; enabled?: boolean }) =>
  useInfiniteQuery({
    queryKey: queryKeys.blogs.homeFeed(HOME_FEED_PAGE_SIZE, opts.section),
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
    queryKey: queryKeys.blogs.explore(params.search, params.sort, EXPLORE_PAGE_SIZE),
    queryFn: ({ pageParam }) => fetchExploreBlogsPage(Number(pageParam), params.search, params.sort),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_next ? lastPage.page + 1 : undefined),
    staleTime: 60_000,
  });

export const useFavoriteBlogs = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.blogs.favorites,
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
      invalidateBlogLists(queryClient, slug);
    },
  });
};

export const useUserBlogs = (authorId: number | undefined) =>
  useQuery({
    queryKey: queryKeys.blogs.byAuthor(authorId),
    queryFn: async () => (await apiClient.get('/blogs/', { params: { author: authorId } })).data as BlogPost[],
    enabled: typeof authorId === 'number' && authorId > 0,
    staleTime: 25_000,
  });

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BlogPayload) => (await apiClient.post('/blogs/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.homeFeedRoot });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.drafts });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

export const useMyDrafts = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.blogs.drafts,
    queryFn: async () =>
      (
        await apiClient.get<PaginatedHomeFeedResponse>('/blogs/', {
          params: { drafts_only: true, page: 1, page_size: 100 },
        })
      ).data,
    enabled: Boolean(token),
    staleTime: 15_000,
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { slug: string } & Partial<BlogPayload>) => {
      const { slug, ...body } = payload;
      return (await apiClient.patch<BlogPost>(`/blogs/${slug}/`, body)).data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.drafts });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      invalidateBlogLists(queryClient, variables.slug);
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
};

export const useUploadBlogMedia = () =>
  useMutation({
    mutationFn: async (payload: { blogId: number; file: File; mediaType: 'image' | 'video' }) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('media_type', payload.mediaType);
      // Let axios set multipart boundary — a manual Content-Type breaks uploads.
      return (await apiClient.post(`/blogs/${payload.blogId}/media/`, formData, { timeout: 120_000 })).data;
    },
  });

export const useCreateShareLink = () =>
  useMutation({
    mutationFn: async (slug: string) =>
      (await apiClient.post<ShareLinkResponse>(`/blogs/${slug}/share/`)).data,
  });

export const useSharedBlog = (token: string) =>
  useQuery({
    queryKey: queryKeys.sharedBlog(token),
    queryFn: async () => (await apiClient.get<BlogPost>(`/blogs/shared/${token}/`)).data,
    enabled: Boolean(token),
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
    queryKey: queryKeys.notifications,
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
      (await apiClient.post(`/notifications/${notificationId}/mark-read/`)).data,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = queryClient.getQueryData<unknown[]>(queryKeys.notifications);
      queryClient.setQueryData(queryKeys.notifications, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((row: { id: number; is_read?: boolean }) =>
          row.id === notificationId ? { ...row, is_read: true } : row,
        );
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.notifications, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post('/notifications/mark-all-read/')).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useBlogComments = (slug: string) =>
  useQuery({
    queryKey: queryKeys.blogs.comments(slug),
    queryFn: async () => (await apiClient.get(`/blogs/${slug}/comments/`)).data,
    enabled: Boolean(slug),
  });

export const useCreateComment = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => (await apiClient.post(`/blogs/${slug}/comments/`, { content })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.comments(slug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detailComments(slug) });
      invalidateBlogLists(queryClient, slug);
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => (await apiClient.post(`/blogs/${slug}/like-toggle/`)).data,
    onSuccess: (_, slug) => {
      invalidateBlogLists(queryClient, slug);
    },
  });
};

export const useAnalytics = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => (await apiClient.get<BlogAnalytics>('/blogs/analytics/')).data,
    enabled: Boolean(token),
  });
};

export const useUsers = (search: string) =>
  useQuery({
    queryKey: queryKeys.users.search(search),
    queryFn: async () => (await apiClient.get('/auth/users/', { params: { search: search || undefined } })).data,
  });

export const useSuggestedUsers = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.suggestedUsers,
    queryFn: async () => (await apiClient.get('/auth/users/suggestions/')).data,
    staleTime: 120_000,
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
  });
};

export const useConversations = () => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.conversations,
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
      invalidateUserLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.homeFeedRoot });
    },
  });
};

export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) =>
      (await apiClient.post<{ following: boolean }>(`/auth/follows/${userId}/toggle/`)).data,
    onSuccess: (data, userId) => {
      queryClient.setQueryData<UserProfile>(queryKeys.userDetail(userId), (old) =>
        old ? { ...old, is_following: data.following } : old,
      );
      void queryClient.refetchQueries({ queryKey: queryKeys.userDetail(userId) });
      invalidateUserLists(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.homeFeedRoot });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

export const useMessages = (withUser?: number) => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.messages.chat(withUser),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.chat(variables.receiver) });
      invalidateMessageLists(queryClient);
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; content: string }) =>
      (await apiClient.patch(`/auth/messages/${payload.id}/`, { content: payload.content })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.root });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await apiClient.delete(`/auth/messages/${id}/`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.root });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

export const useUserDetail = (userId?: number) => {
  const token = useAppSelector((s) => s.auth.accessToken);
  return useQuery({
    queryKey: queryKeys.userDetail(userId),
    queryFn: async () => (await apiClient.get<UserProfile>(`/auth/users/${userId}/`)).data,
    enabled: Boolean(token) && Boolean(userId),
    staleTime: 0,
  });
};

export const useAiGenerateDraft = () =>
  useMutation({
    mutationFn: async (payload: { prompt: string; tone?: string; length?: 'short' | 'medium' | 'long' }) =>
      (await apiClient.post('/ai/generate-draft/', payload)).data,
  });
