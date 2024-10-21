import {
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  AnswersResponse,
  AttachmentResponseBody,
  EntityResponse,
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
  UserTagsResponse,
} from '@drodil/backstage-plugin-qeta-common';

export type GetPostsOptions = {
  type?: PostType;
  noCorrectAnswer?: string;
  offset?: number;
  includeEntities?: boolean;
  includeAnswers?: boolean;
  includeComments?: boolean;
  author?: string;
  orderBy?: string;
  tags?: string[];
  noVotes?: string;
  noAnswers?: string;
  searchQuery?: string;
  random?: string;
  limit?: number;
  favorite?: boolean;
  entity?: string;
  order?: string;
  fromDate?: string;
  toDate?: string;
};

export type GetAnswersOptions = {
  noCorrectAnswer?: string;
  noVotes?: string;
  offset?: number;
  author?: string;
  orderBy?: string;
  searchQuery?: string;
  limit?: number;
  order?: string;
  fromDate?: string;
  toDate?: string;
};

export type RequestOptions = {
  token?: string;
};

export interface QetaApi {
  getPosts(
    options: GetPostsOptions,
    requestOptions?: RequestOptions,
  ): Promise<PostsResponse>;

  getPostsList(type: string, options?: GetPostsOptions): Promise<PostsResponse>;

  createPost(post: PostRequest): Promise<PostResponse>;

  commentPost(id: number, content: string): Promise<PostResponse>;

  deletePostComment(postId: number, id: number): Promise<PostResponse>;

  getPost(id: string | undefined): Promise<PostResponse>;

  getTags(): Promise<TagResponse[]>;

  getEntities(): Promise<EntityResponse[]>;

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

  deletePost(questionId: number): Promise<boolean>;

  deleteAnswer(questionId: number, id: number): Promise<boolean>;

  updatePost(id: string, question: PostRequest): Promise<PostResponse>;

  updateAnswer(id: number, answer: AnswerRequest): Promise<AnswerResponseBody>;

  getAnswers(options: GetAnswersOptions): Promise<AnswersResponse>;

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

  getUserImpact(): Promise<ImpactResponse>;
  getGlobalStats(): Promise<StatisticsResponse>;
  getUserStats(userRef: string): Promise<StatisticsResponse>;
}
