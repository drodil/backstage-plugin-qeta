import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  AnswersResponse,
  AttachmentResponseBody,
  CollectionRequest,
  CollectionResponse,
  CollectionsResponse,
  EntityResponse,
  GlobalStat,
  ImpactResponse,
  PostRequest,
  PostResponse,
  PostsResponse,
  PostType,
  StatisticResponse,
  StatisticsRequestParameters,
  StatisticsResponse,
  TagResponse,
  TemplateRequest,
  TemplateResponse,
  TemplatesResponse,
  UserCollectionsResponse,
  UserEntitiesResponse,
  UserResponse,
  UserStat,
  UserTagsResponse,
  UserUsersResponse,
} from '@drodil/backstage-plugin-qeta-common';

export interface PostsQuery {
  limit?: number;
  offset?: number;
  tags?: string[];
  entity?: string;
  author?: string;
  orderBy?: 'views' | 'score' | 'answersCount' | 'created' | 'updated';
  order?: 'desc' | 'asc';
  noCorrectAnswer?: boolean;
  noAnswers?: boolean;
  favorite?: boolean;
  noVotes?: boolean;
  random?: boolean;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeTrend?: boolean;
  includeComments?: boolean;
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
  type?: PostType;
  collectionId?: number;
}

export interface CollectionsQuery {
  limit?: number;
  offset?: number;
  owner?: string;
  searchQuery?: string;
  orderBy?: 'created' | 'owner';
  order?: 'desc' | 'asc';
}

export interface AnswersQuery {
  limit?: number;
  offset?: number;
  tags?: string[];
  entity?: string;
  author?: string;
  orderBy?: 'score' | 'created' | 'updated';
  order?: 'desc' | 'asc';
  noCorrectAnswer?: boolean;
  noVotes?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeComments?: boolean;
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
}

export type RequestOptions = {
  token?: string;
};

export interface QetaApi {
  getPosts(
    options: PostsQuery,
    requestOptions?: RequestOptions,
  ): Promise<PostsResponse>;

  getPostsList(
    type: string,
    options?: PostsQuery,
    requestOptions?: RequestOptions,
  ): Promise<PostsResponse>;

  createPost(
    post: PostRequest,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  commentPost(
    id: number,
    content: string,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  deletePostComment(
    postId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  getPost(
    id: string | number | undefined,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  getTags(requestOptions?: RequestOptions): Promise<TagResponse[]>;
  getTag(
    tag: string,
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null>;
  updateTag(
    tag: string,
    description?: string,
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null>;

  getEntities(requestOptions?: RequestOptions): Promise<EntityResponse[]>;
  getEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<EntityResponse | null>;

  getUsers(requestOptions?: RequestOptions): Promise<UserResponse[]>;

  getMostUpvotedPosts({
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

  getMostPosts({
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

  votePostUp(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  votePostDown(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  voteAnswerUp(
    postId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponse>;

  voteAnswerDown(
    postId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponse>;

  markAnswerCorrect(
    postId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  markAnswerIncorrect(
    postId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  favoritePost(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  unfavoritePost(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  postAnswer(
    answer: AnswerRequest,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponseBody>;

  postAttachment(
    file: Blob,
    options?: { postId?: number; answerId?: number; collectionId?: number },
    requestOptions?: RequestOptions,
  ): Promise<AttachmentResponseBody>;

  commentAnswer(
    questionId: number,
    id: number,
    content: string,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponse>;

  deleteAnswerComment(
    questionId: number,
    answerId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponse>;

  deletePost(postId: number, requestOptions?: RequestOptions): Promise<boolean>;

  deleteAnswer(
    questionId: number,
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  updatePost(
    id: string,
    question: PostRequest,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  updateAnswer(
    id: number,
    answer: AnswerRequest,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponseBody>;

  getAnswers(
    options: AnswersQuery,
    requestOptions?: RequestOptions,
  ): Promise<AnswersResponse>;

  getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
    requestOptions?: RequestOptions,
  ): Promise<AnswerResponseBody>;

  getFollowedCollections(
    requestOptions?: RequestOptions,
  ): Promise<UserCollectionsResponse>;
  followCollection(
    collectionId: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;
  unfollowCollection(
    collectionId: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  getFollowedTags(requestOptions?: RequestOptions): Promise<UserTagsResponse>;
  followTag(tag: string, requestOptions?: RequestOptions): Promise<boolean>;
  unfollowTag(tag: string, requestOptions?: RequestOptions): Promise<boolean>;

  getFollowedEntities(
    requestOptions?: RequestOptions,
  ): Promise<UserEntitiesResponse>;
  followEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;
  unfollowEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  getFollowedUsers(requestOptions?: RequestOptions): Promise<UserUsersResponse>;
  followUser(
    userRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;
  unfollowUser(
    userRef: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  getUserImpact(requestOptions?: RequestOptions): Promise<ImpactResponse>;
  getGlobalStats(
    requestOptions?: RequestOptions,
  ): Promise<StatisticsResponse<GlobalStat>>;
  getUserStats(
    userRef: string,
    requestOptions?: RequestOptions,
  ): Promise<StatisticsResponse<UserStat>>;

  getCollections(
    options?: CollectionsQuery,
    requestOptions?: RequestOptions,
  ): Promise<CollectionsResponse>;
  getCollection(
    id?: string | number,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse>;
  createCollection(
    collection: CollectionRequest,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse>;
  updateCollection(
    id: number,
    collection: CollectionRequest,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse>;
  deleteCollection(
    id?: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;
  addPostToCollection(
    collectionId: number,
    postId: number,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse>;
  removePostFromCollection(
    collectionId: number,
    postId: number,
    requestOptions?: RequestOptions,
  ): Promise<CollectionResponse>;

  getTemplates(requestOptions?: RequestOptions): Promise<TemplatesResponse>;
  getTemplate(
    id: string | number,
    requestOptions?: RequestOptions,
  ): Promise<TemplateResponse>;
  createTemplate(
    template: TemplateRequest,
    requestOptions?: RequestOptions,
  ): Promise<TemplateResponse>;
  updateTemplate(
    id: string | number,
    template: TemplateRequest,
    requestOptions?: RequestOptions,
  ): Promise<TemplateResponse>;
  deleteTemplate(
    templateId: number,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;
}
