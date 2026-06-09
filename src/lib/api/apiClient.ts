import { env } from '../../config/env';
import { clearAuthToken, getAuthToken } from './authToken';
import { ApiError, type ValidationErrors } from './apiErrors';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuth?: boolean;
};

type LaravelErrorResponse = {
  message?: string;
  errors?: ValidationErrors;
};

function buildUrl(path: string) {
  const normalizedBase = env.apiBaseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (response.status === 204) {
    return undefined as T;
  }
  if (!contentType?.includes('application/json')) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.ok) {
    return parseResponse<T>(response);
  }

  const payload = await parseResponse<LaravelErrorResponse>(response);
  const message = payload?.message ?? 'Erro ao se comunicar com a API.';

  if (response.status === 401) {
    clearAuthToken();
  }

  throw new ApiError(message, response.status, payload?.errors);
}

export type ApiEnvelope<T> = {
  data: T;
};
