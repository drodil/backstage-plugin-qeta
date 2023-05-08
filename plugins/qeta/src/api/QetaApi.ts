import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  AttachmentResponseBody,
  QuestionRequest,
  QuestionResponse,
  QuestionsResponse,
  TagResponse,
} from './types';

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

  getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
  ): Promise<AnswerResponseBody>;
}
