import { apiFetch } from '../../../lib/api';
import type { Tag } from '../../notes/api/notes';

export async function fetchTagsApi(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/tags');
}

export async function fetchTagsPaginatedApi(page: number, limit: number, search?: string): Promise<{ items: Tag[]; total: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    query.set('search', search);
  }
  return apiFetch<{ items: Tag[]; total: number }>(`/tags?${query.toString()}`);
}

export async function createTagApi(name: string): Promise<Tag> {
  return apiFetch<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateTagApi(id: string, name: string): Promise<Tag> {
  return apiFetch<Tag>(`/tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteTagApi(id: string): Promise<void> {
  return apiFetch<void>(`/tags/${id}`, {
    method: 'DELETE',
  });
}
