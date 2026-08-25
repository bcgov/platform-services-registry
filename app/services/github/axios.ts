import axios from 'axios';
import { GITHUB_API_TOKEN, GITHUB_API_URL } from '@/config';

export const instance = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 5000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  },
});

instance.interceptors.request.use(
  async (config) => {
    if (GITHUB_API_TOKEN) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${GITHUB_API_TOKEN}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
