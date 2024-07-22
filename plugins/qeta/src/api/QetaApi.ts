import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  AnswersResponse,
  AttachmentResponseBody,
  EntityResponse,
  QuestionRequest,
  QuestionResponse,
  QuestionsResponse,
  StatisticResponse,
  StatisticsRequestParameters,
  TagResponse,
} from '@drodil/backstage-plugin-qeta-common';

export type GetQuestionsOptions = {
  noCorrectAnswer: string;
  offset: number;
  includeEntities: boolean;
  author?: string;
  orderBy: string;
  tags?: string[];
  noVotes: string;
  noAnswers: string;
  searchQuery: string;
  limit: number;
  favorite?: boolean;
  entity?: string;
  order: string;
  fromDate?: string;
  toDate?: string;
};

export type GetAnswersOptions = {
  noCorrectAnswer: string;
  noVotes: string;
  offset: number;
  author?: string;
  orderBy: string;
  searchQuery: string;
  limit: number;
  order: string;
  fromDate?: string;
  toDate?: string;
};

export interface QetaApi {
  getQuestions(options: GetQuestionsOptions): Promise<QuestionsResponse>;

  getQuestionsList(type: string): Promise<QuestionsResponse>;

  postQuestion(question: QuestionRequest): Promise<QuestionResponse>;

  commentQuestion(id: number, content: string): Promise<QuestionResponse>;

  deleteQuestionComment(
    questionId: number,
    id: number,
  ): Promise<QuestionResponse>;

  getQuestion(id: string | undefined): Promise<QuestionResponse>;

  getTags(): Promise<TagResponse[]>;

  getEntities(): Promise<EntityResponse[]>;

  getMostUpvotedQuestions({
    author,
    options,
  }: StatisticsRequestParameters): Promise<StatisticResponse>;

  getMostUpvotedAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<StatisticResponse>;

  getMostUpvotedCorrectAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<StatisticResponse>;

  getMostQuestions({
    author,
    options,
  }: StatisticsRequestParameters): Promise<StatisticResponse>;

  getMostAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<StatisticResponse>;

  getTopStatisticsHomepage({
    author,
    options,
  }: StatisticsRequestParameters): Promise<StatisticResponse[]>;

  voteQuestionUp(id: number): Promise<QuestionResponse>;

  voteQuestionDown(id: number): Promise<QuestionResponse>;

  voteAnswerUp(questionId: number, id: number): Promise<AnswerResponse>;

  voteAnswerDown(questionId: number, id: number): Promise<AnswerResponse>;

  markAnswerCorrect(questionId: number, id: number): Promise<boolean>;

  markAnswerIncorrect(questionId: number, id: number): Promise<boolean>;

  favoriteQuestion(id: number): Promise<QuestionResponse>;

  unfavoriteQuestion(id: number): Promise<QuestionResponse>;

  postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody>;

  postAttachment(file: Blob): Promise<AttachmentResponseBody>;

  commentAnswer(
    questionId: number,
    id: number,
    content: string,
  ): Promise<AnswerResponse>;

  deleteAnswerComment(
    questionId: number,
    answerId: number,
    id: number,
  ): Promise<AnswerResponse>;

  deleteQuestion(questionId: number): Promise<boolean>;

  deleteAnswer(questionId: number, id: number): Promise<boolean>;

  updateQuestion(
    id: string,
    question: QuestionRequest,
  ): Promise<QuestionResponse>;

  updateAnswer(id: number, answer: AnswerRequest): Promise<AnswerResponseBody>;

  getAnswers(options: GetAnswersOptions): Promise<AnswersResponse>;

  getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
  ): Promise<AnswerResponseBody>;
}
