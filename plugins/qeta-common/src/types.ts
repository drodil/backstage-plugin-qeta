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
  totalArticles: number;
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

export interface PostAnswerEntity extends QetaEntity {
  score: number;
  ownVote?: number;
  comments?: Comment[];
  votes?: Vote[];
  anonymous?: boolean;
}

export type PostType = 'question' | 'article';

export interface Post extends PostAnswerEntity {
  title: string;
  views: number;
  answersCount: number;
  correctAnswer: boolean;
  favorite: boolean;
  tags?: string[];
  entities?: string[];
  answers?: Answer[];
  trend?: number;
  type: PostType;
  headerImage?: string;
}

export interface Question extends Post {
  type: 'question';
}

export interface Article extends Post {
  type: 'article';
}

export type AnswerFilter = {
  property: 'answers.author' | 'answers.id' | 'tags' | 'entityRefs';
  values: Array<string | undefined>;
};

export type PostFilter = {
  property: 'posts.author' | 'posts.id' | 'tags' | 'entityRefs' | 'posts.type';
  values: Array<string | undefined>;
};

export type CommentFilter = {
  property: 'comments.author' | 'comments.id';
  values: Array<string | undefined>;
};

export interface Answer extends PostAnswerEntity {
  postId: number;
  correct: boolean;
  post?: Post;
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

export interface PostsResponse {
  posts: Post[];
  total: number;
}

export type PostsResponseBody = PostsResponse | ErrorResponse;

export type PostResponseBody = Question | ErrorResponse;

export interface PostRequest {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
  type: PostType;
}

export interface AnswerRequest {
  postId: number;
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
  postsCount: number;
}

export interface EntityResponse {
  entityRef: string;
  postsCount: number;
}

export type AttachmentResponseBody = Attachment | ErrorResponse;

export type PostResponse = Post;
export type AnswerResponse = Answer;

export type QetaPostsStatsSignal = {
  type: 'post_stats';
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

export type QetaSignal = QetaPostsStatsSignal | QetaAnswerStatsSignal;

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
    totalArticles: number;
  };
}
