/* eslint-disable no-console */
import {
  AnswersQuery,
  CollectionsQuery,
  PostsQuery,
  QetaApi,
  RequestOptions,
} from './QetaApi';
import { CustomErrorBase } from '@backstage/errors';
import {
  Answer,
  AnswerRequest,
  AnswerResponseBody,
  AnswersResponse,
  AnswersResponseBody,
  AttachmentResponseBody,
  CollectionRequest,
  CollectionResponse,
  CollectionResponseBody,
  CollectionsResponse,
  CollectionsResponseBody,
  EntityResponse,
  GlobalStat,
  ImpactResponse,
  Post,
  PostRequest,
  PostResponseBody,
  PostsResponse,
  PostsResponseBody,
  StatisticResponse,
  StatisticsRequestParameters,
  StatisticsResponse,
  TagResponse,
  UserEntitiesResponse,
  UserResponse,
  UserStat,
  UserTagsResponse,
  UserUsersResponse,
} from '@drodil/backstage-plugin-qeta-common';
import omitBy from 'lodash/omitBy';
import crossFetch from 'cross-fetch';
import qs from 'qs';

export class QetaError extends CustomErrorBase {
  public errors: null | undefined | any[];

  constructor(message: string, errors: null | undefined | any[]) {
    super(message);

    this.errors = errors;
  }
}

export class QetaClient implements QetaApi {
  private readonly fetchApi: { fetch: typeof fetch };
  private readonly discoveryApi: {
    getBaseUrl(pluginId: string): Promise<string>;
  };

  constructor(options: {
    discoveryApi: { getBaseUrl(pluginId: string): Promise<string> };
    fetchApi?: { fetch: typeof fetch };
  }) {
    this.fetchApi = options.fetchApi ?? { fetch: crossFetch };
    this.discoveryApi = options.discoveryApi;
  }

  async getPosts(
    options: PostsQuery,
    requestOptions?: RequestOptions,
  ): Promise<PostsResponse> {
    const response = await this.fetch('/posts', {
      requestOptions,
      queryParams: options,
    });

    if (response.status === 403) {
      return { posts: [], total: 0 };
    }
    const data = (await response.json()) as PostsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getPostsList(
    type: string,
    options?: PostsQuery,
    requestOptions?: RequestOptions,
  ): Promise<PostsResponse> {
    const response = await this.fetch(`/posts/list/${type}`, {
      requestOptions,
      queryParams: options,
    });

    if (response.status === 403) {
      return { posts: [], total: 0 };
    }

    const data = (await response.json()) as PostsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async createPost(
    question: PostRequest,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    const response = await this.fetch(`/posts`, {
      requestOptions,
      reqInit: {
        method: 'POST',
        body: JSON.stringify(question),
        headers: { 'Content-Type': 'application/json' },
      },
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async commentPost(
    id: number,
    content: string,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    const response = await this.fetch(`/posts/${id}/comments`, {
      requestOptions,
      reqInit: {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
      },
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async deletePostComment(
    questionId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    const response = await this.fetch(`/posts/${questionId}/comments/${id}`, {
      reqInit: { method: 'DELETE' },
      requestOptions,
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getPost(id?: string, requestOptions?: RequestOptions): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }

    const response = await this.fetch(`/posts/${id}`, { requestOptions });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getTags(requestOptions?: RequestOptions): Promise<TagResponse[]> {
    const response = await this.fetch('/tags', { requestOptions });
    return (await response.json()) as TagResponse[];
  }

  async getTag(
    tag: string,
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null> {
    const response = await this.fetch(`/tags/${tag}`, { requestOptions });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as TagResponse;
  }

  async updateTag(
    tag: string,
    description?: string,
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null> {
    const response = await this.fetch(`/tags/${tag}`, {
      requestOptions,
      reqInit: {
        method: 'POST',
        body: JSON.stringify({ description }),
        headers: { 'Content-Type': 'application/json' },
      },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as TagResponse;
  }

  async getUsers(requestOptions?: RequestOptions): Promise<UserResponse[]> {
    const response = await this.fetch('/users', { requestOptions });
    return (await response.json()) as UserResponse[];
  }

  async getEntities(
    requestOptions?: RequestOptions,
  ): Promise<EntityResponse[]> {
    const response = await this.fetch('/entities', { requestOptions });
    return (await response.json()) as EntityResponse[];
  }

  async getEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<EntityResponse | null> {
    const response = await this.fetch(`/entities/${entityRef}`, {
      requestOptions,
    });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as EntityResponse;
  }

  async votePostUp(id: number, requestOptions?: RequestOptions): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${id}/upvote`, {
      requestOptions,
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async votePostDown(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${id}/downvote`, {
      requestOptions,
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async favoritePost(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${id}/favorite`, {
      requestOptions,
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async unfavoritePost(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${id}/unfavorite`, {
      requestOptions,
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async postAnswer(
    answer: AnswerRequest,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponseBody> {
    const response = await this.fetch(`/posts/${answer.postId}/answers`, {
      reqInit: {
        method: 'POST',
        body: JSON.stringify({
          answer: answer.answer,
          images: answer.images,
          anonymous: answer.anonymous,
        }),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
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
    requestOptions?: RequestOptions,
  ): Promise<Answer> {
    const response = await this.fetch(
      `/posts/${questionId}/answers/${id}/comments`,
      {
        reqInit: {
          method: 'POST',
          body: JSON.stringify({ content }),
          headers: { 'Content-Type': 'application/json' },
        },
        requestOptions,
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
    requestOptions?: RequestOptions,
  ): Promise<Answer> {
    const response = await this.fetch(
      `/posts/${questionId}/answers/${answerId}/comments/${id}`,
      {
        reqInit: {
          method: 'DELETE',
        },
        requestOptions,
      },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async voteAnswerUp(
    questionId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<Answer> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(
      `/posts/${questionId}/answers/${id}/upvote`,
      { requestOptions },
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
    requestOptions?: RequestOptions,
  ): Promise<Answer> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(
      `/posts/${questionId}/answers/${id}/downvote`,
      { requestOptions },
    );
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async markAnswerCorrect(
    questionId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(
      `/posts/${questionId}/answers/${id}/correct`,
      { requestOptions },
    );
    const data = await response;
    return data.ok;
  }

  async markAnswerIncorrect(
    questionId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    if (!id || !questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(
      `/posts/${questionId}/answers/${id}/incorrect`,
      { requestOptions },
    );
    const data = await response;
    return data.ok;
  }

  async deletePost(
    questionId: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    if (!questionId) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${questionId}`, {
      reqInit: {
        method: 'DELETE',
      },
      requestOptions,
    });
    const data = await response;
    return data.ok;
  }

  async deleteAnswer(
    questionId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    if (!questionId || !id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${questionId}/answers/${id}`, {
      reqInit: {
        method: 'DELETE',
      },
      requestOptions,
    });
    const data = await response;
    return data.ok;
  }

  async updatePost(
    id: string,
    question: PostRequest,
    requestOptions?: RequestOptions,
  ): Promise<Post> {
    const response = await this.fetch(`/posts/${id}`, {
      reqInit: {
        method: 'POST',
        body: JSON.stringify(question),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
    const data = (await response.json()) as PostResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to update', data.errors);
    }

    return data;
  }

  async updateAnswer(
    id: number,
    answer: AnswerRequest,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponseBody> {
    const response = await this.fetch(`/posts/${answer.postId}/answers/${id}`, {
      reqInit: {
        method: 'POST',
        body: JSON.stringify({ answer: answer.answer, images: answer.images }),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getAnswers(
    options: AnswersQuery,
    requestOptions?: RequestOptions,
  ): Promise<AnswersResponse> {
    const response = await this.fetch('/answers', {
      queryParams: options,
      requestOptions,
    });
    if (response.status === 403) {
      return { answers: [], total: 0 };
    }
    const data = (await response.json()) as AnswersResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponseBody> {
    if (!questionId || !id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/posts/${questionId}/answers/${id}`, {
      requestOptions,
    });
    const data = (await response.json()) as AnswerResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getFollowedTags(
    requestOptions?: RequestOptions,
  ): Promise<UserTagsResponse> {
    const response = await this.fetch(`/tags/followed`, { requestOptions });
    return (await response.json()) as UserTagsResponse;
  }

  async followTag(
    tag: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    const response = await this.fetch(`/tags/follow/${tag}`, {
      reqInit: {
        method: 'PUT',
      },
      requestOptions,
    });
    return response.ok;
  }

  async unfollowTag(
    tag: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    const response = await this.fetch(`/tags/follow/${tag}`, {
      reqInit: {
        method: 'DELETE',
      },
      requestOptions,
    });
    return response.ok;
  }

  async getFollowedEntities(
    requestOptions?: RequestOptions,
  ): Promise<UserEntitiesResponse> {
    const response = await this.fetch(`/entities/followed`, { requestOptions });
    return (await response.json()) as UserEntitiesResponse;
  }

  async followEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    const response = await this.fetch(`/entities/follow/${entityRef}`, {
      reqInit: {
        method: 'PUT',
      },
      requestOptions,
    });
    return response.ok;
  }

  async unfollowEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    const response = await this.fetch(`/entities/follow/${entityRef}`, {
      reqInit: {
        method: 'DELETE',
      },
      requestOptions,
    });
    return response.ok;
  }

  async getFollowedUsers(
    requestOptions?: RequestOptions,
  ): Promise<UserUsersResponse> {
    const response = await this.fetch(`/users/followed`, { requestOptions });
    return (await response.json()) as UserUsersResponse;
  }

  async followUser(
    userRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    const response = await this.fetch(`/users/follow/${userRef}`, {
      reqInit: {
        method: 'PUT',
      },
      requestOptions,
    });
    return response.ok;
  }

  async unfollowUser(
    userRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    const response = await this.fetch(`/users/follow/${userRef}`, {
      reqInit: {
        method: 'DELETE',
      },
      requestOptions,
    });
    return response.ok;
  }

  async postAttachment(
    file: Blob,
    options?: { postId?: number; answerId?: number; collectionId?: number },
    requestOptions?: RequestOptions,
  ): Promise<AttachmentResponseBody> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.fetch('/attachments', {
      queryParams: options,
      reqInit: { method: 'POST', body: formData },
      requestOptions,
    });
    return (await response.json()) as AttachmentResponseBody;
  }

  async getMostUpvotedAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const response = await this.fetch('/statistics/answers/top-upvoted-users', {
      queryParams: options.options,
      requestOptions: options.requestOptions,
    });
    return (await response.json()) as StatisticResponse;
  }

  async getMostUpvotedCorrectAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const response = await this.fetch(
      '/statistics/answers/top-correct-upvoted-users',
      {
        queryParams: options.options,
        requestOptions: options.requestOptions,
      },
    );

    return (await response.json()) as StatisticResponse;
  }

  async getMostUpvotedPosts(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const response = await this.fetch('/statistics/posts/top-upvoted-users', {
      queryParams: options.options,
      requestOptions: options.requestOptions,
    });

    return (await response.json()) as StatisticResponse;
  }

  async getMostPosts(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const response = await this.fetch('/statistics/posts/most-questions', {
      queryParams: options.options,
      requestOptions: options.requestOptions,
    });

    return (await response.json()) as StatisticResponse;
  }

  async getMostAnswers(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse> {
    const response = await this.fetch('/statistics/answers/most-answers', {
      queryParams: options.options,
      requestOptions: options.requestOptions,
    });

    return (await response.json()) as StatisticResponse;
  }

  async getTopStatisticsHomepage(
    options: StatisticsRequestParameters,
  ): Promise<StatisticResponse[]> {
    return await Promise.all([
      this.getMostPosts(options),
      this.getMostAnswers(options),
      this.getMostUpvotedPosts(options),
      this.getMostUpvotedAnswers(options),
      this.getMostUpvotedCorrectAnswers(options),
    ]);
  }

  async getUserImpact(
    requestOptions?: RequestOptions,
  ): Promise<ImpactResponse> {
    const response = await this.fetch(`/statistics/user/impact`, {
      requestOptions,
    });

    return (await response.json()) as ImpactResponse;
  }

  async getGlobalStats(
    requestOptions?: RequestOptions,
  ): Promise<StatisticsResponse<GlobalStat>> {
    const response = await this.fetch(`/statistics/global`, { requestOptions });
    return (await response.json()) as StatisticsResponse<GlobalStat>;
  }

  async getUserStats(
    userRef: string,
    requestOptions?: RequestOptions,
  ): Promise<StatisticsResponse<UserStat>> {
    const response = await this.fetch(`/statistics/user/${userRef}`, {
      requestOptions,
    });
    return (await response.json()) as StatisticsResponse<UserStat>;
  }

  async getCollections(
    options?: CollectionsQuery,
    requestOptions?: RequestOptions,
  ): Promise<CollectionsResponse> {
    const response = await this.fetch('/collections', {
      queryParams: options,
      requestOptions,
    });
    if (response.status === 403) {
      return { collections: [], total: 0 };
    }
    const data = (await response.json()) as CollectionsResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async getCollection(
    id?: string,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/collections/${id}`, { requestOptions });

    const data = (await response.json()) as CollectionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async createCollection(
    collection: CollectionRequest,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse> {
    const response = await this.fetch(`/collections`, {
      reqInit: {
        method: 'POST',
        body: JSON.stringify(collection),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
    const data = (await response.json()) as CollectionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to fetch', data.errors);
    }

    return data;
  }

  async updateCollection(
    id: number,
    collection: CollectionRequest,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse> {
    const response = await this.fetch(`/collections/${id}`, {
      reqInit: {
        method: 'POST',
        body: JSON.stringify(collection),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
    const data = (await response.json()) as CollectionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to update', data.errors);
    }

    return data;
  }

  async deleteCollection(
    id?: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean> {
    if (!id) {
      throw new QetaError('Invalid id provided', undefined);
    }
    const response = await this.fetch(`/collections/${id}`, {
      reqInit: {
        method: 'DELETE',
      },
      requestOptions,
    });
    const data = await response;
    return data.ok;
  }

  async addPostToCollection(
    collectionId: number,
    postId: number,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse> {
    const response = await this.fetch(`/collections/${collectionId}/posts`, {
      reqInit: {
        method: 'POST',
        body: JSON.stringify({ postId }),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
    const data = (await response.json()) as CollectionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to update', data.errors);
    }

    return data;
  }

  async removePostFromCollection(
    collectionId: number,
    postId: number,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse> {
    const response = await this.fetch(`/collections/${collectionId}/posts`, {
      reqInit: {
        method: 'DELETE',
        body: JSON.stringify({ postId }),
        headers: { 'Content-Type': 'application/json' },
      },
      requestOptions,
    });
    const data = (await response.json()) as CollectionResponseBody;

    if ('errors' in data) {
      throw new QetaError('Failed to update', data.errors);
    }

    return data;
  }

  private async getBaseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('qeta');
  }

  private fetch = async (
    path: string,
    opts?: {
      queryParams?: any;
      reqInit?: RequestInit;
      requestOptions?: RequestOptions;
    },
  ) => {
    const { queryParams, reqInit = {}, requestOptions } = opts ?? {};
    const query = this.getQueryParameters(queryParams);
    let url = `${await this.getBaseUrl()}${
      path.startsWith('/') ? path : `/${path}`
    }`;
    if (query) {
      url += `?${query}`;
    }

    return this.fetchApi.fetch(url, {
      method: 'GET',
      ...(requestOptions?.token
        ? { headers: { Authorization: `Bearer ${requestOptions.token}` } }
        : undefined),
      ...reqInit,
    });
  };

  private getQueryParameters(params?: any) {
    if (!params) {
      return '';
    }
    const cleaned = omitBy(params, v => !Boolean(v));
    return qs.stringify(cleaned);
  }
}
