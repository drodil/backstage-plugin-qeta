import { GetQuestionsOptions, QetaApi } from './QetaApi';
import { ConfigApi, createApiRef, FetchApi } from '@backstage/core-plugin-api';
import { CustomErrorBase } from '@backstage/errors';
import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  QuestionRequest,
  QuestionResponse,
  QuestionResponseBody,
  QuestionsResponse,
  QuestionsResponseBody,
} from './types';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

export const qetaApiRef = createApiRef<QetaApi>({
  id: 'plugin.qeta.service',
});

export class QetaError extends CustomErrorBase {
  public errors: null | undefined | any[];

  constructor(message: string, errors: null | undefined | any[]) {
    super(message);

    this.errors = errors;
  }
}

export class QetaClient implements QetaApi {
  private readonly baseUrl: string;
  private readonly fetchApi: FetchApi;

  constructor(options: { configApi: ConfigApi; fetchApi: FetchApi }) {
    this.fetchApi = options.fetchApi;
    this.baseUrl = options.configApi.getString('backend.baseUrl');
  }

  async getQuestions(options: GetQuestionsOptions): Promise<QuestionsResponse> {
    const query = new URLSearchParams(
      omitBy(options as any, isEmpty),
    ).toString();

    let url = `${this.baseUrl}/api/qeta/questions`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as QuestionsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async postQuestion(question: QuestionRequest): Promise<QuestionResponse> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions`,
      {
        method: 'POST',
        body: JSON.stringify(question),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getQuestion(id?: string): Promise<QuestionResponse> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}`,
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getTags(): Promise<string[]> {
    const response = await this.fetchApi.fetch(`${this.baseUrl}/api/qeta/tags`);
    return (await response.json()) as string[];
  }

  async voteQuestionUp(id: number): Promise<QuestionResponse> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}/upvote`,
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async voteQuestionDown(id: number): Promise<QuestionResponse> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}/downvote`,
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${answer.questionId}/answers`,
      {
        method: 'POST',
        body: JSON.stringify({ answer: answer.answer }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async voteAnswerUp(questionId: number, id: number): Promise<AnswerResponse> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}/upvote`,
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async voteAnswerDown(
    questionId: number,
    id: number,
  ): Promise<AnswerResponse> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}/downvote`,
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async markAnswerCorrect(questionId: number, id: number): Promise<boolean> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}/correct`,
    );
    const data = await response;
    return data.ok;
  }

  async markAnswerIncorrect(questionId: number, id: number): Promise<boolean> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}/incorrect`,
    );
    const data = await response;
    return data.ok;
  }
}
