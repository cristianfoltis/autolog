import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '../constants/storage';

/* c8 ignore next */
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const api = axios.create({ baseURL });

export function applyAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

api.interceptors.request.use(applyAuthHeader);

export default api;
