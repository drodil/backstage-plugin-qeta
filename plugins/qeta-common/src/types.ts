import { IndexableDocument } from '@backstage/plugin-search-common';

export interface StatisticResponse {
  ranking: Statistic[];
  loggedUser?: Statistic;
}

export interface Statistic {
  author?: string;
  total?: number;
  position?: number;
}

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

export interface Answer extends QuestionAnswerEntity {
  questionId: number;
  correct: boolean;
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
  answerCount?: number;
  views?: number;
}
