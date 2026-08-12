import { apiFetch } from '../../../lib/api';
import type { Topic } from '../../notes/api/notes';

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalFields {
  title: string;
  targetDate: string;
  topicIds?: string[];
}

export async function fetchGoalsApi(): Promise<Goal[]> {
  return apiFetch<Goal[]>('/goals');
}

export async function createGoalApi(fields: CreateGoalFields): Promise<Goal> {
  return apiFetch<Goal>('/goals', {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}

export async function toggleGoalApi(id: string): Promise<Goal> {
  return apiFetch<Goal>(`/goals/${id}/toggle`, {
    method: 'PATCH',
  });
}

export async function deleteGoalApi(id: string): Promise<void> {
  return apiFetch<void>(`/goals/${id}`, {
    method: 'DELETE',
  });
}
