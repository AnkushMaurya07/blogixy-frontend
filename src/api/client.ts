import axios, { type AxiosError } from 'axios';

import { logout, setTokens } from '../features/auth/authSlice';
import { store } from '../store';
import { queryClient } from '../tanstackQuery';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_ORIGIN}/api`,
});

type RetriableRequestConfig = NonNullable<AxiosError['config']> & { _retry?: boolean };

const authEndpoints = ['/auth/login', '/auth/register', '/auth/token/refresh'];
let refreshPromise: Promise<string> | null = null;

const isAuthEndpoint = (url: string | undefined) => {
  const normalizedUrl = url?.split('?')[0].replace(/\/+$/, '');
  return Boolean(normalizedUrl && authEndpoints.some((endpoint) => normalizedUrl.endsWith(endpoint)));
};

const clearSession = () => {
  store.dispatch(logout());
  queryClient.clear();
};

const refreshAccessToken = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    clearSession();
    return Promise.reject(new Error('No refresh token is available.'));
  }

  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ access: string; refresh?: string }>('/auth/token/refresh/', { refresh: refreshToken })
      .then(({ data }) => {
        store.dispatch(setTokens({ access: data.access, refresh: data.refresh ?? refreshToken }));
        return data.access;
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status ?? 0)) {
          clearSession();
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const request = error.config as RetriableRequestConfig | undefined;
    if (!request || request._retry || isAuthEndpoint(request.url)) {
      return Promise.reject(error);
    }

    if (!localStorage.getItem('accessToken') && !localStorage.getItem('refreshToken')) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const accessToken = await refreshAccessToken();
      request.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(request);
    } catch {
      return Promise.reject(error);
    }
  },
);
