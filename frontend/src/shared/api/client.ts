import axios, { AxiosError, type AxiosInstance } from 'axios';
import { config } from '../config';

const TOKEN_KEY = 'gofla.accessToken';
const REFRESH_KEY = 'gofla.refreshToken';

export const tokenStore = {
  get access() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl ? `${config.apiUrl}/api/v1` : '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const token = tokenStore.access;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  // Let the browser set multipart boundaries for FormData uploads.
  if (cfg.data instanceof FormData) {
    delete cfg.headers['Content-Type'];
  }
  return cfg;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return null;
  try {
    const res = await axios.post(
      config.apiUrl ? `${config.apiUrl}/api/v1/auth/refresh` : '/api/v1/auth/refresh',
      { refreshToken },
    );
    const data = res.data?.data ?? res.data;
    tokenStore.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      if (original.data instanceof FormData) {
        return Promise.reject(error);
      }
      original._retry = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Unwraps the { success, data } envelope from the API. */
export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
