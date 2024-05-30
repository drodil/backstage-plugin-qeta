import type {
  Answer,
  Attachment,
  Question,
} from '@drodil/backstage-plugin-qeta-common';
import {
  Statistic,
  StatisticsRequestParameters,
} from '@drodil/backstage-plugin-qeta-common';

export type MaybeAnswer = Answer | null;
export type MaybeQuestion = Question | null;

export interface Questions {
  questions: Question[];
  total: number;
}

export interface QuestionsOptions {
  limit?: number;
  offset?: number;
  author?: string;
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
   */
  getQuestions(user_ref: string, options: QuestionsOptions): Promise<Questions>;

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
   * @param tags optional tags for the question
   * @param components optional entity refs of catalog components for the question
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
   * @param moderator if the current user is the moderator
   */
  deleteQuestionComment(
    question_id: number,
    id: number,
    user_ref: string,
    moderator?: boolean,
  ): Promise<MaybeQuestion>;

  /**
   * Update question
   * @param id question id
   * @param user_ref user name of the user updating question
   * @param title new title
   * @param content new content
   * @param tags new tags
   * @param components new components
   * @param moderator if the current user is the moderator
   */
  updateQuestion(
    id: number,
    user_ref: string,
    title: string,
    content: string,
    tags?: string[],
    components?: string[],
    images?: number[],
    moderator?: boolean,
  ): Promise<MaybeQuestion>;

  /**
   * Delete question. Only the user who created the question can delete it.
   * @param user_ref user name of the user deleting question
   * @param id question id
   * @param moderator if the current user is the moderator
   */
  deleteQuestion(
    user_ref: string,
    id: number,
    moderator?: boolean,
  ): Promise<boolean>;

  /**
   * Answer question
   * @param user_ref user name of the user answering question
   * @param questionId question id
   * @param answer answer content
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
   * @param moderator if the current user is moderator
   */
  deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    moderator?: boolean,
  ): Promise<MaybeAnswer>;

  /**
   * Update answer to a question
   * @param user_ref user name of the user updating the answer
   * @param questionId question id
   * @param answerId answer id
   * @param answer answer content
   * @param moderator if the current user is moderator
   */
  updateAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    answer: string,
    images?: number[],
    moderator?: boolean,
  ): Promise<MaybeAnswer>;

  /** Get answer by id
   * @param answerId answer id
   * @param user_ref user name of the user getting answer
   */
  getAnswer(answerId: number, user_ref: string): Promise<MaybeAnswer>;

  /**
   * Delete answer. Only the user who created the answer can delete it.
   * @param user_ref user name of the user deleting answer
   * @param id answer id
   * @param moderator if the current user is moderator
   */
  deleteAnswer(
    user_ref: string,
    id: number,
    moderator?: boolean,
  ): Promise<boolean>;

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
   * @param user_ref user name of the user marking the answer correct
   * @param questionId question id
   * @param answerId answer id
   * @param moderator if the current user is moderator
   */
  markAnswerCorrect(
    user_ref: string,
    questionId: number,
    answerId: number,
    moderator?: boolean,
  ): Promise<boolean>;

  /**
   * Mark answer incorrect for question. Only user who created the question can mark answer incorrect
   * @param user_ref user name of the user marking the answer incorrect
   * @param questionId question id
   * @param answerId answer id
   * @param moderator if the current user is moderator
   */
  markAnswerIncorrect(
    user_ref: string,
    questionId: number,
    answerId: number,
    moderator?: boolean,
  ): Promise<boolean>;

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
}
