import { apiFetch } from '../../../lib/api';
import type { Topic } from '../../notes/api/notes';

export async function fetchTopicsApi(): Promise<Topic[]> {
  return apiFetch<Topic[]>('/topics');
}

export async function createTopicApi(name: string, description?: string): Promise<Topic> {
  return apiFetch<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}
