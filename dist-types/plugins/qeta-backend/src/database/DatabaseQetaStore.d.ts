import { PluginDatabaseManager } from '@backstage/backend-common';
import { MaybeAnswer, MaybeQuestion, QetaStore, Question, Questions, QuestionsOptions } from './QetaStore';
export declare type RawQuestionEntity = {
    id: number;
    author: string;
    title: string;
    content: string;
    created: Date;
    updated: Date;
    updatedBy: string;
    score: number;
    views: number;
    answersCount: number;
    correctAnswers: number;
};
export declare type RawAnswerEntity = {
    id: number;
    questionId: number;
    author: string;
    content: string;
    correct: boolean;
    score: number;
    created: Date;
    updated: Date;
    updatedBy: string;
};
export declare type RawQuestionVoteEntity = {
    questionId: number;
    author: string;
    score: number;
    timestamp: Date;
};
export declare type RawAnswerVoteEntity = {
    answerId: number;
    author: string;
    score: number;
    timestamp: Date;
};
export declare type RawTagEntity = {
    id: number;
    tag: string;
};
export declare class DatabaseQetaStore implements QetaStore {
    private readonly db;
    static create({ database, }: {
        database: PluginDatabaseManager;
    }): Promise<DatabaseQetaStore>;
    private constructor();
    private mapQuestion;
    private mapAnswer;
    private mapVote;
    private getQuestionTags;
    private getQuestionVotes;
    private getAnswerVotes;
    private getAnswerBaseQuery;
    private getQuestionAnswers;
    private recordQuestionView;
    private getQuestionBaseQuery;
    getQuestions(options: QuestionsOptions): Promise<Questions>;
    getQuestion(user_ref: string, id: number, recordView?: boolean): Promise<MaybeQuestion>;
    getQuestionByAnswerId(user_ref: string, answerId: number, recordView?: boolean): Promise<MaybeQuestion>;
    postQuestion(user_ref: string, title: string, content: string, tags?: string[]): Promise<Question>;
    deleteQuestion(user_ref: string, id: number): Promise<boolean>;
    answerQuestion(user_ref: string, questionId: number, answer: string): Promise<MaybeAnswer>;
    getAnswer(answerId: number): Promise<MaybeAnswer>;
    deleteAnswer(user_ref: string, id: number): Promise<boolean>;
    voteQuestion(user_ref: string, questionId: number, score: number): Promise<boolean>;
    voteAnswer(user_ref: string, answerId: number, score: number): Promise<boolean>;
    private markAnswer;
    markAnswerCorrect(user_ref: string, questionId: number, answerId: number): Promise<boolean>;
    markAnswerIncorrect(user_ref: string, questionId: number, answerId: number): Promise<boolean>;
    getTags(): Promise<string[]>;
}
