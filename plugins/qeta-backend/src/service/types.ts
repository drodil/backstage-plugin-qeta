import { JSONSchemaType } from 'ajv';
import { QetaStore } from '../database/QetaStore';
import {
  AuthService,
  CacheService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { EventsService } from '@backstage/plugin-events-node';
import { SignalsService } from '@backstage/plugin-signals-node';
import { NotificationService } from '@backstage/plugin-notifications-node';
import { NotificationManager } from './NotificationManager';
import {
  AIQuery,
  AnswersQuery,
  CollectionsQuery,
  EntitiesQuery,
  PostsQuery,
  PostType,
  TagsQuery,
  UsersQuery,
} from '@drodil/backstage-plugin-qeta-common';
import { CatalogApi } from '@backstage/catalog-client';
import { AIHandler } from '@drodil/backstage-plugin-qeta-node';

export interface RouterOptions {
  database: QetaStore;
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  catalog: CatalogApi;
  auth: AuthService;
  cache?: CacheService;
  permissions?: PermissionsService;
  events?: EventsService;
  signals?: SignalsService;
  notifications?: NotificationService;
  aiHandler?: AIHandler;
}

export interface RouteOptions extends RouterOptions {
  notificationMgr: NotificationManager;
}

export interface PostContent {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
  user?: string;
  created?: string;
  headerImage?: string;
  anonymous?: boolean;
  type: PostType;
}

export interface TemplateContent {
  title: string;
  description: string;
  questionTitle?: string;
  questionContent?: string;
  tags?: string[];
  entities?: string[];
}

export interface CollectionContent {
  title: string;
  description?: string;
  headerImage?: string;
  images?: number[];
  created?: string;
  readAccess: 'public' | 'private';
  editAccess: 'public' | 'private';
}

export interface CollectionPostContent {
  postId: number;
}

export interface CollectionRankContent {
  postId: number;
  rank: 'top' | 'bottom' | 'up' | 'down';
}

export const CollectionsQuerySchema: JSONSchemaType<CollectionsQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    searchQuery: { type: 'string', nullable: true },
    owner: { type: 'string', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['created', 'title'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entity: { type: 'string', nullable: true },
    fromDate: { type: 'string', nullable: true, format: 'date' },
    toDate: { type: 'string', nullable: true, format: 'date' },
  },
  required: [],
  additionalProperties: false,
};

export const PostsQuerySchema: JSONSchemaType<PostsQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    author: { type: 'string', nullable: true },
    orderBy: {
      type: 'string',
      enum: [
        'rank',
        'views',
        'title',
        'trend',
        'score',
        'answersCount',
        'created',
        'updated',
      ],
      nullable: true,
    },
    collectionId: { type: 'number', nullable: true },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    noCorrectAnswer: { type: 'boolean', nullable: true },
    noAnswers: { type: 'boolean', nullable: true },
    favorite: { type: 'boolean', nullable: true },
    noVotes: { type: 'boolean', nullable: true },
    random: { type: 'boolean', nullable: true },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entity: { type: 'string', nullable: true },
    includeAnswers: { type: 'boolean', nullable: true },
    includeVotes: { type: 'boolean', nullable: true },
    includeEntities: { type: 'boolean', nullable: true },
    includeTrend: { type: 'boolean', nullable: true },
    includeComments: { type: 'boolean', nullable: true },
    searchQuery: { type: 'string', nullable: true },
    fromDate: { type: 'string', nullable: true, format: 'date' },
    toDate: { type: 'string', nullable: true, format: 'date' },
    type: { type: 'string', enum: ['question', 'article'], nullable: true },
  },
  required: [],
  additionalProperties: false,
};

export const TagsQuerySchema: JSONSchemaType<TagsQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['tag', 'postsCount', 'followersCount'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    searchQuery: { type: 'string', nullable: true },
  },
  required: [],
  additionalProperties: false,
};

export const UsersQuerySchema: JSONSchemaType<UsersQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['userRef'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    searchQuery: { type: 'string', nullable: true },
  },
  required: [],
  additionalProperties: false,
};

export const EntitiesQuerySchema: JSONSchemaType<EntitiesQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['entityRef'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    searchQuery: { type: 'string', nullable: true },
  },
  required: [],
  additionalProperties: false,
};

export const AnswersQuerySchema: JSONSchemaType<AnswersQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    author: { type: 'string', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['score', 'created', 'updated'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    noCorrectAnswer: { type: 'boolean', nullable: true },
    noVotes: { type: 'boolean', nullable: true },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entity: { type: 'string', nullable: true },
    includeVotes: { type: 'boolean', nullable: true },
    includeEntities: { type: 'boolean', nullable: true },
    includeComments: { type: 'boolean', nullable: true },
    searchQuery: { type: 'string', nullable: true },
    fromDate: { type: 'string', nullable: true, format: 'date' },
    toDate: { type: 'string', nullable: true, format: 'date' },
  },
  required: [],
  additionalProperties: false,
};

export const PostSchema: JSONSchemaType<PostContent> = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    content: { type: 'string', minLength: 1 },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entities: { type: 'array', items: { type: 'string' }, nullable: true },
    images: { type: 'array', items: { type: 'integer' }, nullable: true },
    user: { type: 'string', minLength: 1, nullable: true },
    created: { type: 'string', minLength: 1, nullable: true },
    anonymous: { type: 'boolean', nullable: true },
    headerImage: { type: 'string', nullable: true },
    type: { type: 'string', enum: ['question', 'article'] },
  },
  required: ['title', 'content'],
  additionalProperties: false,
};

export const TemplateSchema: JSONSchemaType<TemplateContent> = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    questionTitle: { type: 'string', nullable: true },
    questionContent: { type: 'string', nullable: true },
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entities: { type: 'array', items: { type: 'string' }, nullable: true },
  },
  required: ['title', 'description'],
  additionalProperties: false,
};

export const CollectionSchema: JSONSchemaType<CollectionContent> = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    description: { type: 'string', nullable: true },
    headerImage: { type: 'string', nullable: true },
    images: { type: 'array', items: { type: 'integer' }, nullable: true },
    created: { type: 'string', minLength: 1, nullable: true },
    readAccess: { type: 'string', enum: ['public', 'private'] },
    editAccess: { type: 'string', enum: ['public', 'private'] },
  },
  required: ['title', 'readAccess', 'editAccess'],
  additionalProperties: false,
};

export const CollectionPostSchema: JSONSchemaType<CollectionPostContent> = {
  type: 'object',
  properties: {
    postId: { type: 'integer' },
  },
  required: ['postId'],
  additionalProperties: false,
};

export const CollectionRankPostSchema: JSONSchemaType<CollectionRankContent> = {
  type: 'object',
  properties: {
    postId: { type: 'integer' },
    rank: { type: 'string', enum: ['top', 'bottom', 'up', 'down'] },
  },
  required: ['postId', 'rank'],
  additionalProperties: false,
};

export interface AnswerQuestion {
  answer: string;
  images?: number[];
  user?: string;
  created?: string;
  anonymous?: boolean;
}

export const PostAnswerSchema: JSONSchemaType<AnswerQuestion> = {
  type: 'object',
  properties: {
    answer: { type: 'string', minLength: 1 },
    images: { type: 'array', items: { type: 'integer' }, nullable: true },
    user: { type: 'string', minLength: 1, nullable: true },
    created: { type: 'string', minLength: 1, nullable: true },
    anonymous: { type: 'boolean', nullable: true },
  },
  required: ['answer'],
  additionalProperties: false,
};

export interface Comment {
  content: string;
  user?: string;
  created?: string;
}

export const CommentSchema: JSONSchemaType<Comment> = {
  type: 'object',
  properties: {
    content: { type: 'string', minLength: 1 },
    user: { type: 'string', minLength: 1, nullable: true },
    created: { type: 'string', minLength: 1, nullable: true },
  },
  required: ['content'],
  additionalProperties: false,
};

export interface DraftQuestion {
  title: string;
  content: string;
}

export const DraftQuestionSchema: JSONSchemaType<DraftQuestion> = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    content: { type: 'string', minLength: 1 },
  },
  required: ['title', 'content'],
  additionalProperties: false,
};

export const AIQuerySchema: JSONSchemaType<AIQuery> = {
  type: 'object',
  properties: {
    regenerate: { type: 'boolean', default: false, nullable: true },
  },
  required: [],
  additionalProperties: false,
};

export interface File {
  name: string;
  path: string;
  buffer: Buffer;
  mimeType: string;
  ext: string;
  size: number;
}
