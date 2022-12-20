import { GetQuestionsOptions, QetaApi } from './QetaApi';
import { ConfigApi, FetchApi } from '@backstage/core-plugin-api';
import { CustomErrorBase } from '@backstage/errors';
import { AnswerRequest, AnswerResponse, AnswerResponseBody, QuestionRequest, QuestionResponse, QuestionsResponse } from './types';
export declare const qetaApiRef: import("@backstage/core-plugin-api").ApiRef<QetaApi>;
export declare class QetaError extends CustomErrorBase {
    errors: null | undefined | any[];
    constructor(message: string, errors: null | undefined | any[]);
}
export declare class QetaClient implements QetaApi {
    private readonly baseUrl;
    private readonly fetchApi;
    constructor(options: {
        configApi: ConfigApi;
        fetchApi: FetchApi;
    });
    getQuestions(options: GetQuestionsOptions): Promise<QuestionsResponse>;
    postQuestion(question: QuestionRequest): Promise<QuestionResponse>;
    getQuestion(id?: string): Promise<QuestionResponse>;
    getTags(): Promise<string[]>;
    voteQuestionUp(id: number): Promise<QuestionResponse>;
    voteQuestionDown(id: number): Promise<QuestionResponse>;
    postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody>;
    voteAnswerUp(questionId: number, id: number): Promise<AnswerResponse>;
    voteAnswerDown(questionId: number, id: number): Promise<AnswerResponse>;
    markAnswerCorrect(questionId: number, id: number): Promise<boolean>;
    markAnswerIncorrect(questionId: number, id: number): Promise<boolean>;
}
