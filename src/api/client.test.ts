import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { logout, setTokens } from '../features/auth/authSlice';
import { store } from '../store';
import { queryClient } from '../tanstackQuery';
import { apiClient } from './client';

const mock = new MockAdapter(apiClient);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
  store.dispatch(logout());
  queryClient.clear();
});

afterEach(() => {
  mock.reset();
});

describe('API client authentication', () => {
  it('refreshes an expired access token and retries the original request once', async () => {
    store.dispatch(setTokens({ access: 'expired-access', refresh: 'valid-refresh' }));
    const requestAuthorizations: Array<string | undefined> = [];
    mock
      .onGet('/private')
      .replyOnce((request) => {
        requestAuthorizations.push(request.headers?.Authorization as string | undefined);
        return [401];
      })
      .onGet('/private')
      .reply((request) => {
        requestAuthorizations.push(request.headers?.Authorization as string | undefined);
        return [200, { ok: true }];
      });
    mock.onPost('/auth/token/refresh/').reply(200, { access: 'fresh-access' });

    const response = await apiClient.get('/private');

    expect(response.data).toEqual({ ok: true });
    expect(mock.history.get).toHaveLength(2);
    expect(requestAuthorizations).toEqual(['Bearer expired-access', 'Bearer fresh-access']);
    expect(mock.history.post).toHaveLength(1);
    expect(store.getState().auth.accessToken).toBe('fresh-access');
    expect(localStorage.getItem('accessToken')).toBe('fresh-access');
  });

  it('shares one refresh request across concurrent unauthorized requests', async () => {
    store.dispatch(setTokens({ access: 'expired-access', refresh: 'valid-refresh' }));
    mock.onGet('/first').replyOnce(401).onGet('/first').reply(200, { id: 1 });
    mock.onGet('/second').replyOnce(401).onGet('/second').reply(200, { id: 2 });
    mock.onPost('/auth/token/refresh/').reply(200, { access: 'fresh-access' });

    const responses = await Promise.all([apiClient.get('/first'), apiClient.get('/second')]);

    expect(responses.map((response) => response.data.id)).toEqual([1, 2]);
    expect(mock.history.post.filter((request) => request.url === '/auth/token/refresh/')).toHaveLength(1);
  });

  it('does not attach a stale access token to login requests', async () => {
    localStorage.setItem('accessToken', 'expired-access');
    mock.onPost('/auth/login/').reply(200, { access: 'new-access', refresh: 'new-refresh' });

    await apiClient.post('/auth/login/', { username: 'reader', password: 'secret' });

    expect(mock.history.post[0].headers?.Authorization).toBeUndefined();
  });

  it('clears auth and cached data when the refresh token is rejected', async () => {
    store.dispatch(setTokens({ access: 'expired-access', refresh: 'expired-refresh' }));
    queryClient.setQueryData(['private-data'], { value: 'cached' });
    mock.onGet('/private').reply(401);
    mock.onPost('/auth/token/refresh/').reply(401, { detail: 'Token is invalid.' });

    await expect(apiClient.get('/private')).rejects.toMatchObject({ response: { status: 401 } });

    expect(store.getState().auth.accessToken).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(queryClient.getQueryData(['private-data'])).toBeUndefined();
  });

  it('preserves the session when refresh fails transiently', async () => {
    store.dispatch(setTokens({ access: 'expired-access', refresh: 'valid-refresh' }));
    mock.onGet('/private').reply(401);
    mock.onPost('/auth/token/refresh/').reply(503, { detail: 'Temporarily unavailable.' });

    await expect(apiClient.get('/private')).rejects.toMatchObject({ response: { status: 401 } });

    expect(store.getState().auth.accessToken).toBe('expired-access');
    expect(localStorage.getItem('refreshToken')).toBe('valid-refresh');
  });
});