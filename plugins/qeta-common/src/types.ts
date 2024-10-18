import { IndexableDocument } from '@backstage/plugin-search-common';
import { ErrorObject } from 'ajv';

export interface StatisticResponse {
  ranking: Statistic[];
  loggedUser?: Statistic;
}

export interface Statistic {
  author?: string;
  total?: number;
  position?: number;
}

export interface Stat {
  date: Date;
  totalViews: number;
  totalQuestions: number;
  totalAnswers: number;
  totalComments: number;
  totalVotes: number;
}

export interface GlobalStat extends Stat {
  totalTags: number;
  totalUsers: number;
}

export interface UserStat extends Stat {}

export interface StatisticsOptions {
  limit?: number;
  period?: string;
  loggedUser?: string;
}

export interface StatisticsRequestParameters {
  author?: string;
  options?: StatisticsOptions;
}

export interface QetaEntity {
  id: number;
  author: string;
  content: string;
  created: Date;
  own?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  updated?: Date;
  updatedBy?: string;
}

export interface QuestionAnswerEntity extends QetaEntity {
  score: number;
  ownVote?: number;
  comments?: Comment[];
  votes?: Vote[];
  anonymous?: boolean;
}

export interface Question extends QuestionAnswerEntity {
  title: string;
  views: number;
  answersCount: number;
  correctAnswer: boolean;
  favorite: boolean;
  tags?: string[];
  entities?: string[];
  answers?: Answer[];
  trend?: number;
}

export type AnswerFilter = {
  property: 'answers.author' | 'answers.id' | 'tags' | 'entityRefs';
  values: Array<string | undefined>;
};

export type QuestionFilter = {
  property: 'questions.author' | 'questions.id' | 'tags' | 'entityRefs';
  values: Array<string | undefined>;
};

export type CommentFilter = {
  property: 'comments.author' | 'comments.id';
  values: Array<string | undefined>;
};

export interface Answer extends QuestionAnswerEntity {
  questionId: number;
  correct: boolean;
  question?: Question;
}

export interface Vote {
  author: string;
  score: number;
  timestamp: Date;
}

export interface Comment extends QetaEntity {}

export interface Attachment {
  id: number;
  uuid: string;
  locationType: string;
  locationUri: string;
  path: string;
  binaryImage: Buffer;
  mimeType: string;
  extension: string;
  creator: string;
  created: Date;
}

export interface QetaDocument extends IndexableDocument {
  docType: string;
  author: string;
  score: number;
  entityRefs?: string[];
  answerCount?: number;
  views?: number;
  tags?: string[];
  correctAnswer?: boolean;
}

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

export type AnswersResponseBody = AnswersResponse | ErrorResponse;

export interface AnswersResponse {
  answers: Answer[];
  total: number;
}

export type AnswerResponseBody = Answer | ErrorResponse;

export interface TagResponse {
  tag: string;
  questionsCount: number;
}

export interface EntityResponse {
  entityRef: string;
  questionsCount: number;
}

export type AttachmentResponseBody = Attachment | ErrorResponse;

export type QuestionResponse = Question;
export type AnswerResponse = Answer;

export type QetaQuestionStatsSignal = {
  type: 'question_stats';
  views: number;
  score: number;
  answersCount: number;
  correctAnswer: boolean;
};

export type QetaAnswerStatsSignal = {
  type: 'answer_stats';
  score: number;
  correctAnswer: boolean;
};

export type QetaSignal = QetaQuestionStatsSignal | QetaAnswerStatsSignal;

export interface UserTagsResponse {
  tags: string[];
  count: number;
}

export interface UserEntitiesResponse {
  entityRefs: string[];
  count: number;
}

export interface ImpactResponse {
  impact: number;
  lastWeekImpact: number;
}

export interface StatisticsResponse {
  statistics: Stat[];
  summary: {
    totalQuestions: number;
    totalAnswers: number;
    totalVotes: number;
    totalComments: number;
    totalViews: number;
  };
}
