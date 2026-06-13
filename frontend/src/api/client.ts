export const AUTH_TOKEN_KEY = 'porobidder.authToken';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

export function setAuthToken(token: string): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, init);
}

type ApiErrorBody = {
  message?: string;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await apiFetch(path, { ...options, headers });
  const payload = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken('');
    }
    throw new Error(payload.message || 'Request failed. Please try again.');
  }

  return payload;
}
