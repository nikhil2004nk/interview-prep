import { apiFetch } from '../../../lib/api';
import type { Topic } from '../../notes/api/notes';

export async function fetchTopicsApi(): Promise<Topic[]> {
  return apiFetch<Topic[]>('/topics');
}

export async function fetchTopicsPaginatedApi(page: number, limit: number, search?: string): Promise<{ items: Topic[]; total: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) {
    query.set('search', search);
  }
  return apiFetch<{ items: Topic[]; total: number }>(`/topics?${query.toString()}`);
}

export async function createTopicApi(name: string, description?: string): Promise<Topic> {
  return apiFetch<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateTopicApi(id: string, name: string, description?: string): Promise<Topic> {
  return apiFetch<Topic>(`/topics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteTopicApi(id: string): Promise<void> {
  return apiFetch<void>(`/topics/${id}`, {
    method: 'DELETE',
  });
}
