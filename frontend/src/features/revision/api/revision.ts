import { apiFetch } from '../../../lib/api';

export const RevisionItemType = {
  NOTE: 'NOTE' as const,
  QUESTION: 'QUESTION' as const,
};

export type RevisionItemType = typeof RevisionItemType[keyof typeof RevisionItemType];

export interface RevisionRecord {
  id: string;
  itemType: RevisionItemType;
  itemId: string;
  nextRevisionDate: string;
  lastRevisionDate?: string;
  intervalDays: number;
  easeFactor: number;
  createdAt: string;
  updatedAt: string;
  item: {
    id: string;
    title: string;
    content?: string;
    description?: string;
    difficulty?: string;
    topic?: { name: string };
  };
}

export async function fetchDueRevisionsApi(): Promise<RevisionRecord[]> {
  return apiFetch<RevisionRecord[]>('/revision/due');
}

export async function addToRevisionApi(itemId: string, itemType: RevisionItemType): Promise<RevisionRecord> {
  return apiFetch<RevisionRecord>('/revision', {
    method: 'POST',
    body: JSON.stringify({ itemId, itemType }),
  });
}

export async function submitReviewApi(id: string, rating: number): Promise<RevisionRecord> {
  return apiFetch<RevisionRecord>(`/revision/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

export async function deleteFromRevisionApi(id: string): Promise<void> {
  return apiFetch<void>(`/revision/${id}`, {
    method: 'DELETE',
  });
}
