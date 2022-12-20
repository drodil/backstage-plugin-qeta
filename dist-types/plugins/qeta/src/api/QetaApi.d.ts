import { AnswerRequest, AnswerResponse, AnswerResponseBody, QuestionRequest, QuestionResponse, QuestionsResponse } from './types';
export declare type GetQuestionsOptions = {
    limit?: number;
    offset?: number;
    tags?: string[];
    author?: string;
};
export interface QetaApi {
    getQuestions(options: GetQuestionsOptions): Promise<QuestionsResponse>;
    postQuestion(question: QuestionRequest): Promise<QuestionResponse>;
    getQuestion(id: string | undefined): Promise<QuestionResponse>;
    getTags(): Promise<string[]>;
    voteQuestionUp(id: number): Promise<QuestionResponse>;
    voteQuestionDown(id: number): Promise<QuestionResponse>;
    voteAnswerUp(questionId: number, id: number): Promise<AnswerResponse>;
    voteAnswerDown(questionId: number, id: number): Promise<AnswerResponse>;
    markAnswerCorrect(questionId: number, id: number): Promise<boolean>;
    markAnswerIncorrect(questionId: number, id: number): Promise<boolean>;
    postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody>;
}
