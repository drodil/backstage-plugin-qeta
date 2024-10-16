import {
  Answer,
  Attachment,
  Comment,
  GlobalStat,
  Question,
  Statistic,
  StatisticsRequestParameters,
  UserEntitiesResponse,
  UserStat,
  UserTagsResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { QetaFilters } from '../service/util';
import { PermissionCriteria } from '@backstage/plugin-permission-common';

export function isQuestion(
  entity: Question | Answer | Comment,
): entity is Question {
  return 'answers' in entity;
}

export function isAnswer(
  entity: Question | Answer | Comment,
): entity is Answer {
  return !('answers' in entity);
}

export type MaybeAnswer = Answer | null;
export type MaybeQuestion = Question | null;
export type MaybeComment = Comment | null;

export interface Questions {
  questions: Question[];
  total: number;
}

export interface Answers {
  answers: Answer[];
  total: number;
}

export interface QuestionsOptions {
  limit?: number;
  offset?: number;
  author?: string | string[];
  orderBy?:
    | 'views'
    | 'score'
    | 'answersCount'
    | 'created'
    | 'updated'
    | 'trend';
  order?: 'desc' | 'asc';
  noCorrectAnswer?: boolean;
  noAnswers?: boolean;
  noVotes?: boolean;
  favorite?: boolean;
  tags?: string[];
  entity?: string;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeTrend?: boolean;
  random?: boolean;
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AnswersOptions {
  limit?: number;
  offset?: number;
  author?: string;
  noCorrectAnswer?: boolean;
  noVotes?: boolean;
  orderBy?:
    | 'views'
    | 'score'
    | 'answersCount'
    | 'created'
    | 'updated'
    | 'trend';
  order?: 'desc' | 'asc';
  tags?: string[];
  entity?: string;
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
}

export interface TagResponse {
  tag: string;
  questionsCount: number;
}

export interface EntityResponse {
  entityRef: string;
  questionsCount: number;
}

export interface AttachmentParameters {
  uuid: string;
  locationType: string;
  locationUri: string;
  extension: string;
  mimeType: string;
  path?: string;
  binaryImage?: Buffer;
  creator?: string;
}

/**
 * Interface for fetching and modifying Q&A data
 */
export interface QetaStore {
  /**
   * Fetch all stored questions with options
   * @param user_ref user name requesting question
   * @param options Search options
   * @param filters Permission filters
   */
  getQuestions(
    user_ref: string,
    options: QuestionsOptions,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<Questions>;

  /**
   * Fetch single question by id
   * Question views count is increased after fetching the question
   * @param user_ref user name requesting question
   * @param id question id
   * @param recordView record question view, default true
   */
  getQuestion(
    user_ref: string,
    id: number,
    recordView?: boolean,
  ): Promise<MaybeQuestion>;

  /**
   * Fetch single question by answer id
   * Question views count is increased after fetching the question
   * @param user_ref user name requesting question
   * @param answerId answer id
   * @param recordView record question view, default true
   */
  getQuestionByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
  ): Promise<MaybeQuestion>;

  /**
   * Post new question
   * @param user_ref user name of the user posting question
   * @param title question title
   * @param content question content
   * @param created
   * @param tags optional tags for the question
   * @param components optional entity refs of catalog components for the question
   * @param images
   * @param anonymous
   */
  postQuestion(
    user_ref: string,
    title: string,
    content: string,
    created: Date,
    tags?: string[],
    components?: string[],
    images?: number[],
    anonymous?: boolean,
  ): Promise<Question>;

  /**
   * Comment question
   * @param question_id question id
   * @param user_ref user
   * @param content comment content
   * @param created
   */
  commentQuestion(
    question_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybeQuestion>;

  /**
   * Delete question comment
   * @param question_id question id
   * @param id comment id
   * @param user_ref username
   */
  deleteQuestionComment(
    question_id: number,
    id: number,
    user_ref: string,
  ): Promise<MaybeQuestion>;

  /**
   * Update question
   * @param id question id
   * @param user_ref user name of the user updating question
   * @param title new title
   * @param content new content
   * @param tags new tags
   * @param components new components
   * @param images
   */
  updateQuestion(
    id: number,
    user_ref: string,
    title: string,
    content: string,
    tags?: string[],
    components?: string[],
    images?: number[],
  ): Promise<MaybeQuestion>;

  /**
   * Delete question. Only the user who created the question can delete it.
   * @param id question id
   */
  deleteQuestion(id: number): Promise<boolean>;

  /**
   * Answer question
   * @param user_ref user name of the user answering question
   * @param questionId question id
   * @param answer answer content
   * @param created
   * @param images
   * @param anonymous
   */
  answerQuestion(
    user_ref: string,
    questionId: number,
    answer: string,
    created: Date,
    images?: number[],
    anonymous?: boolean,
  ): Promise<MaybeAnswer>;

  /**
   * Comment answer
   * @param answer_id answer id
   * @param user_ref user commenting
   * @param content comment content
   */
  commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybeAnswer>;

  /**
   * Delete answer comment
   * @param answer_id answer id
   * @param id comment id
   * @param user_ref username
   */
  deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
  ): Promise<MaybeAnswer>;

  /**
   * Update answer to a question
   * @param user_ref user name of the user updating the answer
   * @param questionId question id
   * @param answerId answer id
   * @param answer answer content
   * @param images
   */
  updateAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    answer: string,
    images?: number[],
  ): Promise<MaybeAnswer>;

  /**
   * Fetch all stored answers with options
   * @param user_ref user name requesting question
   * @param options Search options
   * @param filters Permission filters
   */
  getAnswers(
    user_ref: string,
    options: AnswersOptions,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<Answers>;

  /** Get answer by id
   * @param answerId answer id
   * @param user_ref user name of the user getting answer
   */
  getAnswer(answerId: number, user_ref: string): Promise<MaybeAnswer>;

  getQuestionComment(commentId: number): Promise<MaybeComment>;
  getAnswerComment(commentId: number): Promise<MaybeComment>;

  /**
   * Delete answer. Only the user who created the answer can delete it.
   * @param id answer id
   */
  deleteAnswer(id: number): Promise<boolean>;

  /**
   * Vote question with given score
   * @param user_ref user name of the user voting question
   * @param questionId question id
   * @param score score to vote with
   */
  voteQuestion(
    user_ref: string,
    questionId: number,
    score: number,
  ): Promise<boolean>;

  /**
   * Vote answer with given score
   * @param user_ref user name of the user voting answer
   * @param answerId answwer id
   * @param score score to vote with
   */
  voteAnswer(
    user_ref: string,
    answerId: number,
    score: number,
  ): Promise<boolean>;

  /**
   * Mark answer correct for question. Only user who created the question can mark answer correct
   * @param questionId question id
   * @param answerId answer id
   */
  markAnswerCorrect(questionId: number, answerId: number): Promise<boolean>;

  /**
   * Mark answer incorrect for question. Only user who created the question can mark answer incorrect
   * @param questionId question id
   * @param answerId answer id
   */
  markAnswerIncorrect(questionId: number, answerId: number): Promise<boolean>;

  /**
   * Mark question favorite for user
   * @param user_ref user name of the user voting question
   * @param questionId question id
   */
  favoriteQuestion(user_ref: string, questionId: number): Promise<boolean>;

  /**
   * Mark question unfavorite for user
   * @param user_ref user name of the user voting question
   * @param questionId question id
   */
  unfavoriteQuestion(user_ref: string, questionId: number): Promise<boolean>;

  /**
   * Returns all used tags for questions
   */
  getTags(): Promise<TagResponse[]>;

  /**
   * Gets all tags user is following
   * @param user_ref
   */
  getUserTags(user_ref: string): Promise<UserTagsResponse>;
  getUsersForTags(tags?: string[]): Promise<string[]>;

  followTag(user_ref: string, tag: string): Promise<boolean>;
  unfollowTag(user_ref: string, tag: string): Promise<boolean>;

  getUserEntities(user_ref: string): Promise<UserEntitiesResponse>;
  getUsersForEntities(entityRefs?: string[]): Promise<string[]>;

  followEntity(user_ref: string, entityRef: string): Promise<boolean>;
  unfollowEntity(user_ref: string, entityRef: string): Promise<boolean>;

  getEntities(): Promise<EntityResponse[]>;

  postAttachment({
    uuid,
    locationType,
    locationUri,
    extension,
    mimeType,
    binaryImage,
    path,
    creator,
  }: AttachmentParameters): Promise<Attachment>;

  getAttachment(uuid: string): Promise<Attachment | undefined>;

  getMostUpvotedQuestions({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getTotalQuestions({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getMostUpvotedAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getMostUpvotedCorrectAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getTotalAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getCount(table: string, user_ref?: string): Promise<number>;
  saveGlobalStats(date: Date): Promise<void>;
  saveUserStats(user_ref: string, date: Date): Promise<void>;
  getUsers(): Promise<string[]>;
  getTotalViews(user_ref: string, lastDays?: number): Promise<number>;
  cleanStats(days: number, date: Date): Promise<void>;
  getGlobalStats(): Promise<GlobalStat[]>;
  getUserStats(user_ref: string): Promise<UserStat[]>;
}
