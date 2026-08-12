import { apiFetch } from '../../../lib/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export async function loginApi(email: string, passwordPlain: string): Promise<User> {
  return apiFetch<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: passwordPlain }),
  });
}

export async function registerApi(email: string, passwordPlain: string, name?: string): Promise<User> {
  return apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: passwordPlain, name }),
  });
}

export async function logoutApi(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getMeApi(): Promise<User> {
  return apiFetch<User>('/auth/me');
}
