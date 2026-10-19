import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './token';
import type { AuthResult, User } from './types';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type AuthFailureHandler = () => void;
let authFailureHandler: AuthFailureHandler | null = null;

export function setAuthFailureHandler(handler: AuthFailureHandler | null): void {
  authFailureHandler = handler;
}

function isAuthRequest(url?: string): boolean {
  if (!url) {
    return false;
  }
  return url.replace(/^\/+/, '').startsWith('auth/');
}

async function attemptRefresh(): Promise<User | null> {
  try {
    const response = await apiClient.post<AuthResult>('/auth/refresh');
    setAccessToken(response.data.accessToken);
    return response.data.user;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<User | null> | null = null;

/**
 * Single-flight session refresh: concurrent callers share one in-flight
 * request. Retries once on failure so a tab whose refresh token was just
 * rotated by another tab can pick up the new cookie on the second attempt.
 */
export function refreshSession(): Promise<User | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const user = await attemptRefresh();
      if (user) {
        return user;
      }
      return attemptRefresh();
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (!config || error.response?.status !== 401 || isAuthRequest(config.url) || config._retried) {
      return Promise.reject(error);
    }
    config._retried = true;

    const user = await refreshSession();
    if (!user) {
      setAccessToken(null);
      authFailureHandler?.();
      return Promise.reject(error);
    }

    const token = getAccessToken();
    config.headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    config.headers.set('Authorization', `Bearer ${token}`);
    return apiClient.request(config);
  },
);
