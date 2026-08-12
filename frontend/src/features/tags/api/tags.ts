import { apiFetch } from '../../../lib/api';
import type { Tag } from '../../notes/api/notes';

export async function fetchTagsApi(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/tags');
}
