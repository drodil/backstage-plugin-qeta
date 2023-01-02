import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  QuestionRequest,
  QuestionResponse,
  QuestionsResponse,
  TagResponse,
} from './types';

export type GetQuestionsOptions = {
  limit?: number;
  offset?: number;
  tags?: string[];
  entity?: string;
  author?: string;
};

export interface QetaApi {
  getQuestions(options: GetQuestionsOptions): Promise<QuestionsResponse>;

  getQuestionsList(type: string): Promise<QuestionsResponse>;

  postQuestion(question: QuestionRequest): Promise<QuestionResponse>;

  getQuestion(id: string | undefined): Promise<QuestionResponse>;

  getTags(): Promise<TagResponse[]>;

  voteQuestionUp(id: number): Promise<QuestionResponse>;

  voteQuestionDown(id: number): Promise<QuestionResponse>;

  voteAnswerUp(questionId: number, id: number): Promise<AnswerResponse>;

  voteAnswerDown(questionId: number, id: number): Promise<AnswerResponse>;

  markAnswerCorrect(questionId: number, id: number): Promise<boolean>;

  markAnswerIncorrect(questionId: number, id: number): Promise<boolean>;

  postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody>;

  deleteQuestion(questionId: number): Promise<boolean>;

  deleteAnswer(questionId: number, id: number): Promise<boolean>;

  updateQuestion(
    id: string,
    question: QuestionRequest,
  ): Promise<QuestionResponse>;
}
