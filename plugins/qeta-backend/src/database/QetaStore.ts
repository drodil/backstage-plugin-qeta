import {
  AIResponse,
  Answer,
  AnswersQuery,
  Attachment,
  Collection,
  CollectionsQuery,
  Comment,
  EntitiesQuery,
  GlobalStat,
  Post,
  PostsQuery,
  PostStatus,
  PostType,
  QetaIdEntity,
  Statistic,
  StatisticsRequestParameters,
  TagResponse,
  TagsQuery,
  TagsResponse,
  Template,
  UserCollectionsResponse,
  UserEntitiesResponse,
  UsersQuery,
  UserStat,
  UserTagsResponse,
  UserUsersResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { QetaFilters } from '../service/util';
import { PermissionCriteria } from '@backstage/plugin-permission-common';

export function isPost(entity: QetaIdEntity): entity is Post {
  return 'title' in entity && !('followers' in entity);
}

export function isAnswer(entity: QetaIdEntity): entity is Answer {
  return 'postId' in entity && 'correct' in entity;
}

export function isComment(entity: QetaIdEntity): entity is Comment {
  return !('title' in entity) && !('correct' in entity);
}

export function isTag(entity: QetaIdEntity): entity is TagResponse {
  return 'tag' in entity;
}

export function isCollection(entity: QetaIdEntity): entity is Collection {
  return 'followers' in entity;
}

export type MaybeAnswer = Answer | null;
export type MaybePost = Post | null;
export type MaybeComment = Comment | null;
export type MaybeTag = TagResponse | null;
export type MaybeCollection = Collection | null;
export type MaybeTemplate = Template | null;

export interface Posts {
  posts: Post[];
  total: number;
}

export interface Answers {
  answers: Answer[];
  total: number;
}

export interface Collections {
  collections: Collection[];
  total: number;
}

export interface Templates {
  templates: Template[];
  total: number;
}

export interface EntityResponse {
  id: number;
  entityRef: string;
  postsCount: number;
  followerCount: number;
}

export interface EntitiesResponse {
  entities: EntityResponse[];
  total: number;
}

export interface UserResponse {
  userRef: string;
  totalViews: number;
  totalQuestions: number;
  totalAnswers: number;
  totalComments: number;
  totalVotes: number;
  totalArticles: number;
  totalFollowers: number;
}

export interface UsersResponse {
  users: UserResponse[];
  total: number;
}

export interface AttachmentParameters {
  uuid: string;
  locationType: string;
  locationUri: string;
  extension: string;
  mimeType: string;
  path?: string;
  binaryImage?: Buffer;
  creator?: string;
  postId?: number;
  answerId?: number;
  collectionId?: number;
}

export interface CollectionPostRank {
  postId: number;
  rank: number;
}

export type PostOptions = {
  tagsFilter?: PermissionCriteria<QetaFilters>;
  commentsFilter?: PermissionCriteria<QetaFilters>;
  answersFilter?: PermissionCriteria<QetaFilters>;
  includeDraftFilter?: boolean;
  includeTags?: boolean;
  includeAnswers?: boolean;
  includeVotes?: boolean;
  includeEntities?: boolean;
  includeComments?: boolean;
  includeAttachments?: boolean;
  includeTotal?: boolean;
  includeExperts?: boolean;
};

export type CollectionOptions = {
  filters?: PermissionCriteria<QetaFilters>;
  postFilters?: PermissionCriteria<QetaFilters>;
  tagFilters?: PermissionCriteria<QetaFilters>;
  includePosts?: boolean;
  includeExperts?: boolean;
};

export type AnswerOptions = {
  filter?: PermissionCriteria<QetaFilters>;
  includeVotes?: boolean;
  includeComments?: boolean;
  includePost?: boolean;
  includeExperts?: boolean;
  commentsFilter?: PermissionCriteria<QetaFilters>;
};

/**
 * Interface for fetching and modifying Q&A data
 */
export interface QetaStore {
  /**
   * Fetch all stored posts with options
   */
  getPosts(
    user_ref: string,
    options: PostsQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: PostOptions,
  ): Promise<Posts>;

  /**
   * Fetch single question by id
   * Question views count is increased after fetching the question
   */
  getPost(
    user_ref: string,
    id: number,
    recordView?: boolean,
    options?: PostOptions,
  ): Promise<MaybePost>;

  /**
   * Fetch single question by answer id
   * Question views count is increased after fetching the question
   */
  getPostByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
    options?: PostOptions,
  ): Promise<MaybePost>;

  /**
   * Post new post
   */
  createPost(options: {
    user_ref: string;
    title: string;
    content: string;
    created: Date;
    tags?: string[];
    entities?: string[];
    images?: number[];
    anonymous?: boolean;
    type?: PostType;
    headerImage?: string;
    status?: PostStatus;
    opts?: PostOptions;
  }): Promise<Post>;

  /**
   * Comment question
   */
  commentPost(
    question_id: number,
    user_ref: string,
    content: string,
    created: Date,
    options?: PostOptions,
  ): Promise<MaybePost>;

  updatePostComment(
    post_id: number,
    id: number,
    user_ref: string,
    content: string,
    options?: PostOptions,
  ): Promise<MaybePost>;

  /**
   * Delete question comment
   */
  deletePostComment(
    question_id: number,
    id: number,
    user_ref: string,
    options?: PostOptions,
  ): Promise<MaybePost>;

  /**
   * Update question
   */
  updatePost(options: {
    id: number;
    user_ref: string;
    title: string;
    content: string;
    tags?: string[];
    entities?: string[];
    images?: number[];
    headerImage?: string;
    status?: PostStatus;
    opts?: PostOptions;
  }): Promise<MaybePost>;

  /**
   * Delete question. Only the user who created the question can delete it.
   * @param id question id
   */
  deletePost(id: number, permanently?: boolean): Promise<boolean>;

  /**
   * Answer question
   */
  answerPost(
    user_ref: string,
    questionId: number,
    answer: string,
    created: Date,
    images?: number[],
    anonymous?: boolean,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer>;

  /**
   * Comment answer
   */
  commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer>;

  updateAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    content: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer>;

  /**
   * Delete answer comment
   */
  deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer>;

  /**
   * Update answer to a question
   */
  updateAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    answer: string,
    images?: number[],
    options?: AnswerOptions,
  ): Promise<MaybeAnswer>;

  /**
   * Fetch all stored answers with options
   */
  getAnswers(
    user_ref: string,
    options: AnswersQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: AnswerOptions,
  ): Promise<Answers>;

  /** Get answer by id
   */
  getAnswer(
    answerId: number,
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer>;

  getComments(options?: { ids?: number[] }): Promise<Comment[]>;
  getComment(
    commentId: number,
    opts?: { postId?: number; answerId?: number },
  ): Promise<MaybeComment>;

  /**
   * Delete answer. Only the user who created the answer can delete it.
   * @param id answer id
   */
  deleteAnswer(id: number): Promise<boolean>;

  /**
   * Vote question with given score
   * @param user_ref user name of the user voting question
   * @param postId question id
   * @param score score to vote with
   */
  votePost(user_ref: string, postId: number, score: number): Promise<boolean>;

  deletePostVote(user_ref: string, postId: number): Promise<boolean>;

  /**
   * Vote answer with given score
   * @param user_ref user name of the user voting answer
   * @param answerId answwer id
   * @param score score to vote with
   */
  voteAnswer(
    user_ref: string,
    answerId: number,
    score: number,
  ): Promise<boolean>;

  deleteAnswerVote(user_ref: string, answerId: number): Promise<boolean>;

  /**
   * Mark answer correct for question. Only user who created the question can mark answer correct
   * @param questionId question id
   * @param answerId answer id
   */
  markAnswerCorrect(questionId: number, answerId: number): Promise<boolean>;

  /**
   * Mark answer incorrect for question. Only user who created the question can mark answer incorrect
   * @param questionId question id
   * @param answerId answer id
   */
  markAnswerIncorrect(questionId: number, answerId: number): Promise<boolean>;

  /**
   * Mark question favorite for user
   * @param user_ref user name of the user voting question
   * @param postId post id
   */
  favoritePost(user_ref: string, postId: number): Promise<boolean>;

  /**
   * Mark question unfavorite for user
   * @param user_ref user name of the user voting question
   * @param postId post id
   */
  unfavoritePost(user_ref: string, postId: number): Promise<boolean>;

  getUsersWhoFavoritedPost(postId: number): Promise<string[]>;

  /**
   * Returns all used tags for posts
   */
  getTags(
    options?: { noDescription?: boolean; ids?: number[] } & TagsQuery,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<TagsResponse>;
  getTagById(id: number): Promise<TagResponse | null>;
  getTag(tag: string): Promise<TagResponse | null>;
  createTag(
    tag: string,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null>;
  updateTag(
    id: number,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null>;
  deleteTag(id: number): Promise<boolean>;
  getTagExperts(tags: string[]): Promise<string[]>;

  getUsers(
    options?: { entityRefs?: string[] } & UsersQuery,
  ): Promise<UsersResponse>;
  getUsersCount(): Promise<number>;
  getUser(user_ref: string): Promise<UserResponse | null>;
  getUserTags(
    user_ref: string,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<UserTagsResponse>;
  getUsersForTags(tags?: string[]): Promise<string[]>;

  followTag(user_ref: string, tag: string): Promise<boolean>;
  unfollowTag(user_ref: string, tag: string): Promise<boolean>;

  getUserEntities(user_ref: string): Promise<UserEntitiesResponse>;
  getUsersForEntities(entityRefs?: string[]): Promise<string[]>;

  followEntity(user_ref: string, entityRef: string): Promise<boolean>;
  unfollowEntity(user_ref: string, entityRef: string): Promise<boolean>;

  getFollowedUsers(user_ref: string): Promise<UserUsersResponse>;
  getFollowingUsers(user_ref: string): Promise<string[]>;

  followUser(user_ref: string, followedUserRef: string): Promise<boolean>;
  unfollowUser(user_ref: string, followedUserRef: string): Promise<boolean>;

  getEntities(
    options?: { entityRefs?: string[] } & EntitiesQuery,
  ): Promise<EntitiesResponse>;
  getEntity(entity_ref: string): Promise<EntityResponse | null>;

  getUserCollections(
    user_ref: string,
    options?: CollectionOptions,
  ): Promise<UserCollectionsResponse>;
  getUsersForCollection(collectionId: number): Promise<string[]>;

  followCollection(user_ref: string, collectionId: number): Promise<boolean>;
  unfollowCollection(user_ref: string, collectionId: number): Promise<boolean>;

  postAttachment({
    uuid,
    locationType,
    locationUri,
    extension,
    mimeType,
    binaryImage,
    path,
    creator,
  }: AttachmentParameters): Promise<Attachment>;

  getAttachment(uuid: string): Promise<Attachment | undefined>;
  deleteAttachment(uuid: string): Promise<boolean>;
  getDeletableAttachments(dayLimit: number): Promise<Attachment[]>;

  getMostUpvotedPosts({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getTotalPosts({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getMostUpvotedAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getMostUpvotedCorrectAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getTotalAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]>;
  getCount(
    table: string,
    filters?: { author?: string; type?: PostType },
  ): Promise<number>;
  saveGlobalStats(date: Date): Promise<void>;
  saveUserStats(user: UserResponse, date: Date): Promise<void>;
  getTotalViews(
    user_ref: string,
    lastDays?: number,
    excludeUser?: boolean,
  ): Promise<number>;
  cleanStats(days: number, date: Date): Promise<void>;
  getGlobalStats(): Promise<GlobalStat[]>;
  getUserStats(user_ref: string): Promise<UserStat[]>;

  getCollections(
    user_ref: string,
    options: CollectionsQuery,
    opts?: CollectionOptions,
  ): Promise<Collections>;

  getCollection(
    user_ref: string,
    id: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection>;

  createCollection(options: {
    user_ref: string;
    title: string;
    description?: string;
    created: Date;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<Collection>;

  updateCollection(options: {
    id: number;
    user_ref: string;
    title: string;
    description?: string;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<MaybeCollection>;

  deleteCollection(id: number): Promise<boolean>;

  addPostToCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection>;
  removePostFromCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection>;

  getTemplates(): Promise<Templates>;
  getTemplate(id: number): Promise<MaybeTemplate>;
  createTemplate(options: {
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<Template>;
  deleteTemplate(id: number): Promise<boolean>;
  updateTemplate(options: {
    id: number;
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<MaybeTemplate>;

  getAIAnswer(postId: number): Promise<AIResponse | null>;
  saveAIAnswer(postId: number, response: AIResponse): Promise<void>;
  deleteAIAnswer(postId: number): Promise<boolean>;

  getPostRank(collectionId: number, postId: number): Promise<number | null>;
  getTopRankedPostId(collectionId: number): Promise<CollectionPostRank | null>;
  getBottomRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null>;
  getNextRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null>;
  getPreviousRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null>;
  updatePostRank(
    collectionId: number,
    postId: number,
    rank: number,
  ): Promise<void>;
}
