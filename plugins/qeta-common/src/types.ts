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

export interface Question {
  id: number;
  author: string;
  title: string;
  content: string;
  created: Date;
  updated?: Date;
  updatedBy?: string;
  score: number;
  views: number;
  answersCount: number;
  correctAnswer: boolean;
  favorite: boolean;
  ownVote?: number;
  tags?: string[];
  entities?: string[];
  answers?: Answer[];
  own?: boolean;
  votes?: Vote[];
  trend?: number;
  comments?: Comment[];
}

export interface Answer {
  id: number;
  questionId: number;
  author: string;
  content: string;
  correct: boolean;
  created: Date;
  updated?: Date;
  updatedBy?: string;
  score: number;
  ownVote?: number;
  own?: boolean;
  votes?: Vote[];
  comments?: Comment[];
}

export interface Vote {
  author: string;
  score: number;
  timestamp: Date;
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  created: Date;
  own?: boolean;
  updated?: Date;
  updatedBy?: string;
}

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
