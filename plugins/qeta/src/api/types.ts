import { ErrorObject } from 'ajv';

interface CustomError {
  message: string;
}

interface ErrorResponse {
  errors: ErrorObject<string, any>[] | CustomError[] | null | undefined;
  type: 'query' | 'body';
}

export interface QuestionsResponse {
  questions: QuestionResponse[];
  total: number;
}

export type QuestionsResponseBody = QuestionsResponse | ErrorResponse;

export interface QuestionResponse {
  id: number;
  author: string;
  title: string;
  content: string;
  tags?: string[];
  created: Date;
  views: number;
  score: number;
  answersCount: number;
  correctAnswer: boolean;
  ownVote?: number;
  updated?: string;
  updatedBy?: string;
  own?: boolean;
  answers?: AnswerResponse[];
  votes?: VoteResponse[];
}

export type QuestionResponseBody = QuestionResponse | ErrorResponse;

export interface QuestionRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface AnswerRequest {
  questionId: number;
  answer: string;
}

export interface AnswerResponse {
  id: number;
  author: string;
  content: string;
  questionId: number;
  created: Date;
  score: number;
  updated?: Date;
  correct: boolean;
  updatedBy: string;
  ownVote?: number;
  own?: boolean;
  votes?: VoteResponse[];
}

export type AnswerResponseBody = AnswerResponse | ErrorResponse;

export interface VoteResponse {
  author: string;
  score: number;
  timestamp: Date;
}
