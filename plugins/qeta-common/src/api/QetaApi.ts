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

  getPostsList(type: string, options?: PostsQuery): Promise<PostsResponse>;

  createPost(post: PostRequest): Promise<PostResponse>;

  commentPost(id: number, content: string): Promise<PostResponse>;

  deletePostComment(postId: number, id: number): Promise<PostResponse>;

  getPost(id: string | undefined): Promise<PostResponse>;

  getTags(): Promise<TagResponse[]>;
  getTag(tag: string): Promise<TagResponse | null>;
  updateTag(tag: string, description?: string): Promise<TagResponse | null>;

  getEntities(): Promise<EntityResponse[]>;
  getEntity(entityRef: string): Promise<EntityResponse | null>;

  getUsers(): Promise<UserResponse[]>;

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

  votePostUp(id: number): Promise<PostResponse>;

  votePostDown(id: number): Promise<PostResponse>;

  voteAnswerUp(postId: number, id: number): Promise<AnswerResponse>;

  voteAnswerDown(postId: number, id: number): Promise<AnswerResponse>;

  markAnswerCorrect(postId: number, id: number): Promise<boolean>;

  markAnswerIncorrect(postId: number, id: number): Promise<boolean>;

  favoritePost(id: number): Promise<PostResponse>;

  unfavoritePost(id: number): Promise<PostResponse>;

  postAnswer(answer: AnswerRequest): Promise<AnswerResponseBody>;

  postAttachment(
    file: Blob,
    options?: { postId?: number; answerId?: number; collectionId?: number },
  ): Promise<AttachmentResponseBody>;

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

  deletePost(postId: number): Promise<boolean>;

  deleteAnswer(questionId: number, id: number): Promise<boolean>;

  updatePost(id: string, question: PostRequest): Promise<PostResponse>;

  updateAnswer(id: number, answer: AnswerRequest): Promise<AnswerResponseBody>;

  getAnswers(options: AnswersQuery): Promise<AnswersResponse>;

  getAnswer(
    questionId: string | number | undefined,
    id: string | number | undefined,
  ): Promise<AnswerResponseBody>;

  getFollowedTags(): Promise<UserTagsResponse>;
  followTag(tag: string): Promise<boolean>;
  unfollowTag(tag: string): Promise<boolean>;

  getFollowedEntities(): Promise<UserEntitiesResponse>;
  followEntity(entityRef: string): Promise<boolean>;
  unfollowEntity(entityRef: string): Promise<boolean>;

  getFollowedUsers(): Promise<UserUsersResponse>;
  followUser(userRef: string): Promise<boolean>;
  unfollowUser(userRef: string): Promise<boolean>;

  getUserImpact(): Promise<ImpactResponse>;
  getGlobalStats(): Promise<StatisticsResponse<GlobalStat>>;
  getUserStats(userRef: string): Promise<StatisticsResponse<UserStat>>;

  getCollections(options?: CollectionsQuery): Promise<CollectionsResponse>;
  getCollection(id?: string): Promise<CollectionResponse>;
  createCollection(collection: CollectionRequest): Promise<CollectionResponse>;
  updateCollection(
    id: number,
    collection: CollectionRequest,
  ): Promise<CollectionResponse>;
  deleteCollection(id?: number): Promise<boolean>;
  addPostToCollection(
    collectionId: number,
    postId: number,
  ): Promise<CollectionResponse>;
  removePostFromCollection(
    collectionId: number,
    postId: number,
  ): Promise<CollectionResponse>;
}
