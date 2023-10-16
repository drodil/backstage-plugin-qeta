import { ErrorObject } from 'ajv';
import {
  Answer,
  Attachment,
  Question,
} from '@drodil/backstage-plugin-qeta-common';

interface CustomError {
  message: string;
}

interface ErrorResponse {
  errors: ErrorObject<string, any>[] | CustomError[] | null | undefined;
  type: 'query' | 'body';
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
}

export type QuestionsResponseBody = QuestionsResponse | ErrorResponse;

export type QuestionResponseBody = Question | ErrorResponse;

export interface QuestionRequest {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
}

export interface AnswerRequest {
  questionId: number;
  answer: string;
  images?: number[];
  anonymous?: boolean;
}

export type AnswerResponseBody = Answer | ErrorResponse;

export interface TagResponse {
  tag: string;
  questionsCount: number;
}

export type AttachmentResponseBody = Attachment | ErrorResponse;

export type QuestionResponse = Question;
export type AnswerResponse = Answer;
