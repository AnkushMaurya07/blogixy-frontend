import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: `${API_ORIGIN.replace(/\/$/, '')}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
