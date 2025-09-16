import {
  AIResponse,
  AIStatusResponse,
  AnswerRequest,
  AnswerResponse,
  AnswerResponseBody,
  AnswersResponse,
  AttachmentResponseBody,
  CollectionRequest,
  CollectionResponse,
  CollectionsResponse,
  EntitiesResponse,
  EntityResponse,
  GlobalStat,
  ImpactResponse,
  PostRequest,
  PostResponse,
  PostsResponse,
  PostStatus,
  PostType,
  StatisticResponse,
  StatisticsRequestParameters,
  StatisticsResponse,
  SuggestionsResponse,
  TagResponse,
  TagsResponse,
  TagSuggestionsResponse,
  TemplateRequest,
  TemplateResponse,
  TemplatesResponse,
  UserCollectionsResponse,
  UserEntitiesResponse,
  UsersResponse,
  UserStat,
  UserTagsResponse,
  UserUsersResponse,
} from '@drodil/backstage-plugin-qeta-common';

export interface PaginatedQuery {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: string;
  searchQuery?: string;
}

export interface PostsQuery extends PaginatedQuery {
  tags?: string[];
  tagsRelation?: 'and' | 'or';
  entities?: string[];
  entitiesRelation?: 'and' | 'or';
  author?: string | string[];
  excludeAuthors?: string[];
  noCorrectAnswer?: boolean;
  noAnswers?: boolean;
  hasAnswers?: boolean;
  favorite?: boolean;
  noVotes?: boolean;
  random?: boolean;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeTrend?: boolean;
  includeComments?: boolean;
  includeTags?: boolean;
  includeAttachments?: boolean;
  includeExperts?: boolean;
  fromDate?: string;
  toDate?: string;
  type?: PostType;
  collectionId?: number;
  ids?: number[];
  checkAccess?: boolean;
  status?: PostStatus;
}

export interface CollectionsQuery extends PaginatedQuery {
  owner?: string;
  entities?: string[];
  entitiesRelation?: 'and' | 'or';
  includePosts?: boolean;
  tags?: string[];
  tagsRelation?: 'and' | 'or';
  fromDate?: string;
  toDate?: string;
  ids?: number[];
  checkAccess?: boolean;
  includeExperts?: boolean;
}

export interface AnswersQuery extends PaginatedQuery {
  tags?: string[];
  tagsRelation?: 'and' | 'or';
  entities?: string[];
  entitiesRelation?: 'and' | 'or';
  author?: string;
  orderBy?: 'score' | 'created' | 'updated';
  noCorrectAnswer?: boolean;
  noVotes?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeComments?: boolean;
  includeExperts?: boolean;
  fromDate?: string;
  toDate?: string;
  ids?: number[];
  checkAccess?: boolean;
}

export interface TagsQuery extends PaginatedQuery {
  orderBy?: 'tag' | 'postsCount' | 'followersCount';
  checkAccess?: boolean;
  includeExperts?: boolean;
}

export interface UsersQuery extends PaginatedQuery {
  orderBy?: 'userRef';
}

export interface EntitiesQuery extends PaginatedQuery {
  orderBy?: 'entityRef';
}

export interface AIQuery {
  regenerate?: boolean;
}

export type RequestOptions = {
  token?: string;
};

export interface SuggestionsQuery {
  limit?: number;
}

export interface TagSuggestionsQuery {
  title: string;
  content: string;
}

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

  updatePostComment(
    postId: number,
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

  getAIAnswerForQuestion(
    questionId: string | number,
    options?: AIQuery,
    requestOptions?: RequestOptions,
  ): Promise<AIResponse | null>;

  getAIAnswerForDraft(
    title: string,
    content: string,
    requestOptions?: RequestOptions,
  ): Promise<AIResponse | null>;

  getAISummaryForArticle(
    articleId: string | number,
    options?: AIQuery,
    requestOptions?: RequestOptions,
  ): Promise<AIResponse | null>;

  isAIEnabled(): Promise<AIStatusResponse>;

  getTags(
    options?: TagsQuery,
    requestOptions?: RequestOptions,
  ): Promise<TagsResponse>;
  getTag(
    tag: string,
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null>;
  createTag(
    tag: string,
    description?: string,
    experts?: string[],
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null>;
  updateTag(
    id: number,
    description?: string,
    experts?: string[],
    requestOptions?: RequestOptions,
  ): Promise<TagResponse | null>;

  getEntities(
    options?: EntitiesQuery,
    requestOptions?: RequestOptions,
  ): Promise<EntitiesResponse>;
  getEntity(
    entityRef: string,
    requestOptions?: RequestOptions,
  ): Promise<EntityResponse | null>;

  getUsers(
    options?: UsersQuery,
    requestOptions?: RequestOptions,
  ): Promise<UsersResponse>;

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

  clickLink(
    id: number
  ): Promise<void>;

  votePostUp(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  votePostDown(
    id: number,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  deletePostVote(
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

  deleteAnswerVote(
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

  updateAnswerComment(
    questionId: number,
    answerId: number,
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

  deletePost(
    postId: number,
    reason?: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  deleteAnswer(
    postId: number | string,
    id: number,
    reason?: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

  updatePost(
    id: string | number,
    question: PostRequest,
    requestOptions?: RequestOptions,
  ): Promise<PostResponse>;

  restorePost(
    id: string | number,
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
  deleteTag(
    id: number,
    reason?: string,
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

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
    reason?: string,
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
  rankPostInCollection(
    collectionId: number,
    postId: number,
    rank: 'top' | 'bottom' | 'up' | 'down',
    requestOptions?: RequestOptions,
  ): Promise<boolean>;

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

  getSuggestions(
    options?: SuggestionsQuery,
    requestOptions?: RequestOptions,
  ): Promise<SuggestionsResponse>;

  getTagSuggestions(
    options: TagSuggestionsQuery,
    requestOptions?: RequestOptions,
  ): Promise<TagSuggestionsResponse>;
}
