import { apiFetch } from '../../../lib/api';

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  topic?: Topic;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteFields {
  title: string;
  content: string;
  topicId?: string;
  tagNames?: string[];
}

export interface UpdateNoteFields {
  title?: string;
  content?: string;
  topicId?: string | null;
  tagNames?: string[];
}

export async function fetchNotesApi(): Promise<Note[]> {
  return apiFetch<Note[]>('/notes');
}

export async function fetchNoteDetailsApi(id: string): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`);
}

export async function createNoteApi(fields: CreateNoteFields): Promise<Note> {
  return apiFetch<Note>('/notes', {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}

export async function updateNoteApi(id: string, fields: UpdateNoteFields): Promise<Note> {
  return apiFetch<Note>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function deleteNoteApi(id: string): Promise<void> {
  return apiFetch<void>(`/notes/${id}`, {
    method: 'DELETE',
  });
}
