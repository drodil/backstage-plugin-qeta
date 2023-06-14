import { JSONSchemaType } from 'ajv';

export interface QuestionsQuery {
  limit?: number;
  offset?: number;
  tags?: string[];
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
}

export interface PostQuestion {
  title: string;
  content: string;
  tags?: string[];
  entities?: string[];
  images?: number[];
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
    tags: { type: 'array', items: { type: 'string' }, nullable: true },
    entity: { type: 'string', nullable: true },
    includeAnswers: { type: 'boolean', nullable: true },
    includeVotes: { type: 'boolean', nullable: true },
    includeEntities: { type: 'boolean', nullable: true },
    includeTrend: { type: 'boolean', nullable: true },
    includeComments: { type: 'boolean', nullable: true },
    searchQuery: { type: 'string', nullable: true },
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
  },
  required: ['title', 'content'],
  additionalProperties: false,
};

export interface AnswerQuestion {
  answer: string;
  images?: number[];
}

export const PostAnswerSchema: JSONSchemaType<AnswerQuestion> = {
  type: 'object',
  properties: {
    answer: { type: 'string', minLength: 1 },
    images: { type: 'array', items: { type: 'integer' }, nullable: true },
  },
  required: ['answer'],
  additionalProperties: false,
};

export interface Comment {
  content: string;
}

export const CommentSchema: JSONSchemaType<Comment> = {
  type: 'object',
  properties: {
    content: { type: 'string', minLength: 1 },
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
