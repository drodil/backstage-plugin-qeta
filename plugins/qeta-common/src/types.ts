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
  totalLinks: number;
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

export interface QetaIdEntity {
  id: number;
}

export interface QetaEntity extends QetaIdEntity {
  author: string;
  content: string;
  created: Date;
  own?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  updated?: Date;
  updatedBy?: string;
  experts?: string[];
}

export interface PostAnswerEntity extends QetaEntity {
  score: number;
  ownVote?: number;
  comments?: Comment[];
  votes?: Vote[];
  anonymous?: boolean;
}

export interface CollectionEntity extends QetaIdEntity {
  title: string;
  description?: string;
  owner: string;
  created: Date;
  headerImage?: string;
  experts?: string[];
}

export type PostType = 'question' | 'article' | 'link';

export type PostStatus = 'draft' | 'active' | 'deleted';

export type AnswerCommentStatus = 'active' | 'deleted';

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
  url?: string;
  images?: number[];
  status: PostStatus;
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

export interface Link extends Post {
  type: 'link';
}

export type AnswerFilter = {
  property:
    | 'answers.author'
    | 'answers.id'
    | 'tags'
    | 'entityRefs'
    | 'tag.experts';
  values: Array<string | undefined>;
};

export type PostFilter = {
  property:
    | 'posts.author'
    | 'posts.id'
    | 'tags'
    | 'entityRefs'
    | 'posts.type'
    | 'tag.experts';
  values: Array<string | undefined>;
};

export type CommentFilter = {
  property: 'comments.author' | 'comments.id';
  values: Array<string | undefined>;
};

export type TagFilter = {
  property: 'tags.tag' | 'tag.experts';
  values: Array<string | undefined>;
};

export type CollectionFilter = {
  property:
    | 'collections.owner'
    | 'collections.id'
    | 'tags'
    | 'entityRefs'
    | 'tag.experts';
  values: Array<string | undefined>;
};

export interface Answer extends PostAnswerEntity {
  postId: number;
  correct: boolean;
  post?: Post;
  images: number[];
  expert?: boolean;
  status: AnswerCommentStatus;
}

export interface Collection extends CollectionEntity {
  tags?: string[];
  entities?: string[];
  posts?: Post[];
  canEdit?: boolean;
  canDelete?: boolean;
  images: number[];
  postsCount: number;
  followers: number;
}

export interface Vote {
  author: string;
  score: number;
  timestamp: Date;
}

export interface Comment extends QetaEntity {
  expert?: boolean;
  status: AnswerCommentStatus;
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

export interface QetaSearchDocument extends IndexableDocument {
  docType: 'qeta_post' | 'qeta_collection';
}

export interface QetaPostDocument extends QetaSearchDocument {
  docType: 'qeta_post';
  author: string;
  score: number;
  postType: PostType;
  entityRefs?: string[];
  answerCount: number;
  created: Date;
  trend?: number;
  views: number;
  tags?: string[];
  correctAnswer?: boolean;
}

export interface QetaCollectionDocument extends QetaSearchDocument {
  docType: 'qeta_collection';
  owner: string;
  created: Date;
  headerImage?: string;
  postsCount: number;
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
  url?: string;
  type: PostType;
  status?: PostStatus;
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

export interface TagResponse extends QetaIdEntity {
  tag: string;
  description?: string;
  experts?: string[];
  postsCount: number;
  followerCount: number;
  canEdit?: boolean;
  canDelete?: boolean;
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
  totalLinks: number;
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

export type AIStatusResponse = {
  enabled: boolean;
  existingQuestions: boolean;
  newQuestions: boolean;
  articleSummaries: boolean;
};

export type AIResponse = {
  answer: string;
  created?: Date;
};

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

export type SuggestionType =
  | 'noCorrectAnswer'
  | 'newQuestion'
  | 'newArticle'
  | 'newLink'
  | 'draftPost';

export interface Suggestion {
  type: SuggestionType;
  id: string;
}

export interface NoCorrectAnswerSuggestion extends Suggestion {
  type: 'noCorrectAnswer';
  question: Question;
}

export interface NewQuestionSuggestion extends Suggestion {
  type: 'newQuestion';
  question: Question;
}

export interface DraftPostSuggestion extends Suggestion {
  type: 'draftPost';
  post: Post;
}

export interface NewArticleSuggestion extends Suggestion {
  type: 'newArticle';
  article: Article;
}

export interface NewLinkSuggestion extends Suggestion {
  type: 'newLink';
  link: Link;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export interface TagSuggestionsResponse {
  tags: string[];
}

export interface URLMetadataRequest {
  url: string;
}

export interface URLMetadataResponse {
  title?: string;
  content?: string;
}
