/* eslint-disable no-console */
import { QetaApi } from './QetaApi';
import { ConfigApi, createApiRef, FetchApi } from '@backstage/core-plugin-api';
import { CustomErrorBase } from '@backstage/errors';
import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  AttachmentResponseBody,
  QuestionRequest,
  QuestionResponse,
  QuestionResponseBody,
  QuestionsResponse,
  QuestionsResponseBody,
  TagResponse,
} from './types';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';
import {
  StatisticResponse,
  StatisticsRequestParameters,
} from '@drodil/backstage-plugin-qeta-common';

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

  async getQuestions(options: {
    noCorrectAnswer: string;
    offset: number;
    includeEntities: boolean;
    author: string | undefined;
    orderBy: string;
    tags: string[] | undefined;
    noVotes: string;
    noAnswers: string;
    searchQuery: string;
    limit: number;
    favorite: undefined | boolean;
    entity: string | undefined;
    order: string;
  }): Promise<QuestionsResponse> {
    const query = this.getQueryParameters(options).toString();

    let url = `${this.baseUrl}/api/qeta/questions`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);
    if (response.status === 403) {
      return { questions: [], total: 0 };
    }
    const data = (await response.json()) as QuestionsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getQuestionsList(type: string): Promise<QuestionsResponse> {
    const query = new URLSearchParams({ limit: '7' }).toString();

    let url = `${this.baseUrl}/api/qeta/questions/list/${type}`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);
    if (response.status === 403) {
      return { questions: [], total: 0 };
    }

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

  async commentQuestion(
    id: number,
    content: string,
  ): Promise<QuestionResponse> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async deleteQuestionComment(
    questionId: number,
    id: number,
  ): Promise<QuestionResponse> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/comments/${id}`,
      {
        method: 'DELETE',
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

  async getTags(): Promise<TagResponse[]> {
    const response = await this.fetchApi.fetch(`${this.baseUrl}/api/qeta/tags`);
    return (await response.json()) as TagResponse[];
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

  async favoriteQuestion(id: number): Promise<QuestionResponse> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}/favorite`,
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async unfavoriteQuestion(id: number): Promise<QuestionResponse> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}/unfavorite`,
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
        body: JSON.stringify({ answer: answer.answer, images: answer.images }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async commentAnswer(
    questionId: number,
    id: number,
    content: string,
  ): Promise<AnswerResponse> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async deleteAnswerComment(
    questionId: number,
    answerId: number,
    id: number,
  ): Promise<AnswerResponse> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${answerId}/comments/${id}`,
      {
        method: 'DELETE',
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

  async deleteQuestion(questionId: number): Promise<boolean> {
    if (!questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}`,
      {
        method: 'DELETE',
      },
    );
    const data = await response;
    return data.ok;
  }

  async deleteAnswer(questionId: number, id: number): Promise<boolean> {
    if (!questionId || !id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}`,
      {
        method: 'DELETE',
      },
    );
    const data = await response;
    return data.ok;
  }

  async updateQuestion(
    id: string,
    question: QuestionRequest,
  ): Promise<QuestionResponse> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${id}`,
      {
        method: 'POST',
        body: JSON.stringify(question),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as QuestionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to update', data.errors);
    }

    return data;
  }

  async updateAnswer(
    id: number,
    answer: AnswerRequest,
  ): Promise<AnswerResponseBody> {
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${answer.questionId}/answers/${id}`,
      {
        method: 'POST',
        body: JSON.stringify({ answer: answer.answer, images: answer.images }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
  ): Promise<AnswerResponseBody> {
    if (!questionId || !id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetchApi.fetch(
      `${this.baseUrl}/api/qeta/questions/${questionId}/answers/${id}`,
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async postAttachment(file: Blob): Promise<AttachmentResponseBody> {
    const qetaUrl = `${this.baseUrl}/api/qeta/attachments`;
    const formData = new FormData();

    formData.append('image', file);

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    const response = await fetch(qetaUrl, requestOptions);
    return (await response.json()) as AttachmentResponseBody;
  }

  async getMostUpvotedAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();

    let url = `${this.baseUrl}/api/qeta/statistics/answers/top-upvoted-users`;
    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getMostUpvotedCorrectAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();
    let url = `${this.baseUrl}/api/qeta/statistics/answers/top-correct-upvoted-users`;

    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getMostUpvotedQuestions(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const query = this.getQueryParameters(options.options).toString();
    let url = `${this.baseUrl}/api/qeta/statistics/answers/top-correct-upvoted-users`;

    if (query) {
      url += `?${query}`;
    }

    const response = await this.fetchApi.fetch(url);

    const data = (await response.json()) as StatisticResponse;

    return data;
  }

  async getTopStatisticsHomepage(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse[]> {
    const response = await Promise.all([
      this.getMostUpvotedQuestions(options),
      this.getMostUpvotedAnswers(options),
      this.getMostUpvotedCorrectAnswers(options),
    ]);

    return response;
  }

  private getQueryParameters(params: any): URLSearchParams {
    const asStrings = Object.fromEntries(
      Object.entries(params).map(([k, v]) => {
        if (!v) {
          return [k, ''];
        }
        return [k, `${v}`];
      }),
    );
    return new URLSearchParams(omitBy(asStrings, isEmpty));
  }
}
