import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { apiClient } from './client';
import { useInfiniteHomeFeed, useUpdateProfile } from './hooks';
import { logout } from '../features/auth/authSlice';
import { store } from '../store';

const mock = new MockAdapter(apiClient);
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={store}>
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  </Provider>
);

beforeEach(() => {
  mock.reset();
  testQueryClient.clear();
  localStorage.clear();
  store.dispatch(logout());
});

afterEach(() => {
  cleanup();
  mock.reset();
});

describe('frontend API hooks', () => {
  it('submits profile updates without logging profile data', async () => {
    const profile = { id: 4, username: 'writer', email: 'writer@example.com', role: 'author' };
    mock.onPost('/auth/profile/').reply(200, profile);
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ username: 'writer', email: 'writer@example.com', bio: 'A short bio' });
    });

    expect(JSON.parse(String(mock.history.post[0].data))).toEqual({
      username: 'writer',
      email: 'writer@example.com',
      bio: 'A short bio',
    });
  });

  it('loads the next home-feed page when requested', async () => {
    const makePage = (page: number, hasNext: boolean) => ({
      results: [
        {
          id: page,
          author: 1,
          author_name: 'writer',
          title: `Post ${page}`,
          slug: `post-${page}`,
          content: 'Post content',
          is_published: true,
          view_count: 0,
          likes_count: 0,
          comments_count: 0,
        },
      ],
      count: 2,
      page,
      page_size: 10,
      has_next: hasNext,
    });
    mock
      .onGet('/blogs/feed/', { params: { page: 1, page_size: 10, section: 'all' } })
      .reply(200, makePage(1, true));
    mock
      .onGet('/blogs/feed/', { params: { page: 2, page_size: 10, section: 'all' } })
      .reply(200, makePage(2, false));
    const { result } = renderHook(() => useInfiniteHomeFeed({ section: 'all' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages.map((page) => page.page)).toEqual([1, 2]));
    expect(mock.history.get.map((request) => request.params?.page)).toEqual([1, 2]);
  });
});