import 'server-only';

import axios from 'axios';
import { GITHUB_API_URL } from '@/config';

export const instance = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 5000,
  maxRedirects: 0,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
  },
});
