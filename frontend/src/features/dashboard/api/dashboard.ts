import { apiFetch } from '../../../lib/api';

export interface DashboardMetrics {
  notesCount: number;
  questionsPracticedCount: number;
  averageScore: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  revisionDueCount: number;
}

export async function fetchDashboardMetricsApi(): Promise<DashboardMetrics> {
  return apiFetch<DashboardMetrics>('/dashboard/metrics');
}
