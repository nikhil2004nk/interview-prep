import { apiFetch } from '../../../lib/api';
import type { Tag, Topic } from '../../notes/api/notes';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  topic?: Topic;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  userAnswer: string;
  feedback?: string;
  score?: number;
  createdAt: string;
}

export interface CreateQuestionFields {
  title: string;
  description?: string;
  difficulty: Difficulty;
  topicId?: string;
  tagNames?: string[];
}

export async function fetchQuestionsApi(): Promise<Question[]> {
  return apiFetch<Question[]>('/questions');
}

export async function createQuestionApi(fields: CreateQuestionFields): Promise<Question> {
  return apiFetch<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}

export async function submitAnswerApi(questionId: string, userAnswer: string): Promise<Answer> {
  return apiFetch<Answer>('/answers', {
    method: 'POST',
    body: JSON.stringify({ questionId, userAnswer }),
  });
}

export async function fetchQuestionPracticesApi(questionId: string): Promise<Answer[]> {
  return apiFetch<Answer[]>(`/answers/question/${questionId}`);
}
