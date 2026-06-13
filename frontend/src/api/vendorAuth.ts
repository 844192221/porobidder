import { apiFetch } from './client';

export const VENDOR_TOKEN_KEY = 'porobidder.vendorToken';

export type VendorProfile = {
  vendorId: string;
  email: string;
};

type VendorLoginResponse = {
  token: string;
  vendor: VendorProfile;
};

type ApiErrorBody = {
  message?: string;
};

export function getVendorToken(): string {
  return localStorage.getItem(VENDOR_TOKEN_KEY) ?? '';
}

export function setVendorToken(token: string): void {
  if (token) {
    localStorage.setItem(VENDOR_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(VENDOR_TOKEN_KEY);
  }
}

export async function vendorApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getVendorToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await apiFetch(path, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    if (response.status === 401) {
      setVendorToken('');
    }
    throw new Error(payload.message || 'Request failed. Please try again.');
  }

  return payload;
}

export async function vendorRegister(
  vendorId: string,
  password: string,
  email: string,
): Promise<VendorProfile> {
  const response = await vendorApiRequest<VendorLoginResponse>('/api/vendor/auth/register', {
    method: 'POST',
    body: JSON.stringify({ vendorId, password, email }),
  });
  setVendorToken(response.token);
  return response.vendor;
}

export async function vendorLogin(vendorId: string, password: string): Promise<VendorProfile> {
  const response = await vendorApiRequest<VendorLoginResponse>('/api/vendor/auth/login', {
    method: 'POST',
    body: JSON.stringify({ vendorId, password }),
  });
  setVendorToken(response.token);
  return response.vendor;
}

export async function vendorLogout(): Promise<void> {
  const token = getVendorToken();
  if (token) {
    try {
      await vendorApiRequest<void>('/api/vendor/auth/logout', { method: 'POST' });
    } catch {
      // Clear local session even if server logout fails.
    }
  }
  setVendorToken('');
}

export async function vendorGetSession(): Promise<VendorProfile | null> {
  if (!getVendorToken()) return null;
  try {
    return await vendorApiRequest<VendorProfile>('/api/vendor/auth/me');
  } catch {
    setVendorToken('');
    return null;
  }
}
