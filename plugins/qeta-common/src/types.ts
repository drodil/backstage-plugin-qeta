import { IndexableDocument } from '@backstage/plugin-search-common';
import { ErrorObject } from 'ajv';
import { RequestOptions } from './api';

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

export interface UserStat extends Stat {
  totalFollowers: number;
}

export interface StatisticsOptions {
  limit?: number;
  period?: string;
  loggedUser?: string;
  type?: PostType;
}

export interface StatisticsRequestParameters {
  author?: string;
  options?: StatisticsOptions;
  requestOptions?: RequestOptions;
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

export interface CollectionEntity {
  id: number;
  title: string;
  description?: string;
  owner: string;
  created: Date;
  headerImage?: string;
  readAccess: 'private' | 'public';
  editAccess: 'private' | 'public';
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
  images: number[];
}

export interface Template {
  id: number;
  title: string;
  description: string;
  questionTitle?: string;
  questionContent?: string;
  tags: string[];
  entities: string[];
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
  images: number[];
}

export interface Collection extends CollectionEntity {
  tags?: string[];
  entities?: string[];
  posts?: Post[];
  canEdit: boolean;
  canDelete: boolean;
  images: number[];
  followers: number;
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

export interface QetaPostDocument extends IndexableDocument {
  docType: string;
  author: string;
  score: number;
  entityRefs?: string[];
  answerCount?: number;
  views?: number;
  tags?: string[];
  correctAnswer?: boolean;
}

export interface QetaCollectionDocument extends IndexableDocument {
  docType: string;
  owner: string;
  created: Date;
  headerImage?: string;
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

export interface CollectionsResponse {
  collections: Collection[];
  total: number;
}

export interface TemplatesResponse {
  templates: Template[];
  total: number;
}

export type PostsResponseBody = PostsResponse | ErrorResponse;

export type PostResponseBody = Question | ErrorResponse;

export type CollectionsResponseBody = CollectionsResponse | ErrorResponse;

export interface CollectionRequest {
  title: string;
  description?: string;
  readAccess: 'public' | 'private';
  editAccess: 'public' | 'private';
  images: number[];
  headerImage?: string;
}

export interface PostRequest {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
  headerImage?: string;
  type: PostType;
}

export interface TemplateRequest {
  title: string;
  description: string;
  questionTitle?: string;
  questionContent?: string;
  tags?: string[];
  entities?: string[];
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
  id: number;
  tag: string;
  description?: string;
  postsCount: number;
  followerCount: number;
}

export interface TagsResponse {
  tags: TagResponse[];
  total: number;
}

export interface EntityResponse {
  id: number;
  entityRef: string;
  postsCount: number;
  followerCount: number;
}

export interface EntitiesResponse {
  entities: EntityResponse[];
  total: number;
}

export interface UserResponse {
  userRef: string;
  totalViews: number;
  totalQuestions: number;
  totalAnswers: number;
  totalComments: number;
  totalVotes: number;
  totalArticles: number;
}

export interface UsersResponse {
  users: UserResponse[];
  total: number;
}

export type AttachmentResponseBody = Attachment | ErrorResponse;

export type PostResponse = Post;
export type AnswerResponse = Answer;
export type CollectionResponse = Collection;
export type TemplateResponse = Template;

export type CollectionResponseBody = CollectionResponse | ErrorResponse;

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

export interface UserCollectionsResponse {
  collections: Collection[];
  count: number;
}

export interface UserEntitiesResponse {
  entityRefs: string[];
  count: number;
}

export interface UserUsersResponse {
  followedUserRefs: string[];
  count: number;
}

export interface ImpactResponse {
  impact: number;
  lastWeekImpact: number;
}

export interface StatisticsResponse<T extends Stat> {
  statistics: T[];
  summary: T;
}
