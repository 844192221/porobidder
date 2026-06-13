import { apiRequest } from './client';

export type UserDto = {
  userId: string;
  money: number;
};

export type LoginResponse = {
  token: string;
  user: UserDto;
};

export function login(userId: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export function fetchMe(): Promise<UserDto> {
  return apiRequest<UserDto>('/api/auth/me');
}

export function logout(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' });
}
