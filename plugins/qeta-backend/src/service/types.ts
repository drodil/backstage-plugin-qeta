import { JSONSchemaType } from 'ajv';
import { QetaStore } from '../database/QetaStore';
import {
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

export interface RouterOptions {
  database: QetaStore;
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  permissions?: PermissionsService;
  events?: EventsService;
  signals?: SignalsService;
  notifications?: NotificationService;
}

export interface RouteOptions extends RouterOptions {
  notificationMgr: NotificationManager;
}

export interface QuestionsQuery {
  limit?: number;
  offset?: number;
  tags?: string;
  entity?: string;
  author?: string;
  orderBy?: 'views' | 'score' | 'answersCount' | 'created' | 'updated';
  order?: 'desc' | 'asc';
  noCorrectAnswer?: boolean;
  noAnswers?: boolean;
  favorite?: boolean;
  noVotes?: boolean;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeTrend?: boolean;
  includeComments?: boolean;
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PostQuestion {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
  user?: string;
  created?: string;
  anonymous?: boolean;
}

export const QuestionsQuerySchema: JSONSchemaType<QuestionsQuery> = {
  type: 'object',
  properties: {
    limit: { type: 'integer', nullable: true },
    offset: { type: 'integer', nullable: true },
    author: { type: 'string', nullable: true },
    orderBy: {
      type: 'string',
      enum: ['views', 'score', 'answersCount', 'created', 'updated'],
      nullable: true,
    },
    order: { type: 'string', enum: ['desc', 'asc'], nullable: true },
    noCorrectAnswer: { type: 'boolean', nullable: true },
    noAnswers: { type: 'boolean', nullable: true },
    favorite: { type: 'boolean', nullable: true },
    noVotes: { type: 'boolean', nullable: true },
    tags: { type: 'string', nullable: true },
    entity: { type: 'string', nullable: true },
    includeAnswers: { type: 'boolean', nullable: true },
    includeVotes: { type: 'boolean', nullable: true },
    includeEntities: { type: 'boolean', nullable: true },
    includeTrend: { type: 'boolean', nullable: true },
    includeComments: { type: 'boolean', nullable: true },
    searchQuery: { type: 'string', nullable: true },
    fromDate: { type: 'string', nullable: true, format: 'date' },
    toDate: { type: 'string', nullable: true, format: 'date' },
  },
  required: [],
  additionalProperties: false,
};

export const PostQuestionSchema: JSONSchemaType<PostQuestion> = {
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
  },
  required: ['title', 'content'],
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

export interface File {
  name: string;
  path: string;
  buffer: Buffer;
  mimeType: string;
  ext: string;
  size: number;
}
