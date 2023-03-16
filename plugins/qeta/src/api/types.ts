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

export interface CommentResponse {
  id: number;
  content: string;
  author: string;
  created: Date;
  own: boolean;
  updated?: Date;
  updatedBy?: string;
}

export type QuestionsResponseBody = QuestionsResponse | ErrorResponse;

export interface QuestionResponse {
  id: number;
  author: string;
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  created: Date;
  views: number;
  score: number;
  answersCount: number;
  correctAnswer: boolean;

  favorite: boolean;
  ownVote?: number;
  updated?: string;
  updatedBy?: string;
  own?: boolean;
  answers?: AnswerResponse[];
  votes?: VoteResponse[];
  comments: CommentResponse[];
}

export type QuestionResponseBody = QuestionResponse | ErrorResponse;

export interface QuestionRequest {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
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
  comments?: CommentResponse[];
}

export type AnswerResponseBody = AnswerResponse | ErrorResponse;

export interface VoteResponse {
  author: string;
  score: number;
  timestamp: Date;
}

export interface TagResponse {
  tag: string;
  questionsCount: number;
}
