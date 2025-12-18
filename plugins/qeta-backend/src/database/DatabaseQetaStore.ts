import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

import {
  AnswerOptions,
  Answers,
  AttachmentParameters,
  CollectionOptions,
  CollectionPostRank,
  Collections,
  CommentOptions,
  EntitiesResponse,
  EntityResponse,
  MaybeAnswer,
  MaybeCollection,
  MaybePost,
  PostOptions,
  Posts,
  QetaStore,
  Templates,
  UserResponse,
  UsersResponse,
} from './QetaStore';
import {
  AIResponse,
  AnswersQuery,
  Attachment,
  Collection,
  Comment as QetaComment,
  EntitiesQuery,
  EntityLinks,
  GlobalStat,
  Post,
  PostStatus,
  PostType,
  PostsQuery,
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
import { TagDatabase } from '@drodil/backstage-plugin-qeta-node';
import { PostsStore } from './stores/PostsStore';
import { AnswersStore } from './stores/AnswersStore';
import { CommentsStore } from './stores/CommentsStore';
import { CollectionsStore } from './stores/CollectionsStore';
import { StatsStore } from './stores/StatsStore';
import { TagsStore } from './stores/TagsStore';
import { UsersStore } from './stores/UsersStore';
import { EntitiesStore } from './stores/EntitiesStore';
import { TemplatesStore } from './stores/TemplatesStore';
import { AttachmentsStore } from './stores/AttachmentsStore';

const migrationsDir = resolvePackagePath(
  '@drodil/backstage-plugin-qeta-backend',
  'migrations',
);

// Local interfaces removed, imported from stores

export class DatabaseQetaStore implements QetaStore {
  private constructor(
    private readonly postsStore: PostsStore,
    private readonly answersStore: AnswersStore,
    private readonly commentsStore: CommentsStore,
    private readonly collectionsStore: CollectionsStore,
    private readonly statsStore: StatsStore,
    private readonly tagsStore: TagsStore,
    private readonly usersStore: UsersStore,
    private readonly entitiesStore: EntitiesStore,
    private readonly templatesStore: TemplatesStore,
    private readonly attachmentsStore: AttachmentsStore,
  ) {}

  static async create({
    database,
    skipMigrations,
    tagDatabase,
  }: {
    database: DatabaseService;
    skipMigrations?: boolean;
    tagDatabase?: TagDatabase;
  }): Promise<DatabaseQetaStore> {
    const client = await database.getClient();

    if (!database.migrations?.skip && !skipMigrations) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    const commentsStore = new CommentsStore(client);
    const tagsStore = new TagsStore(client, tagDatabase);
    const entitiesStore = new EntitiesStore(client);
    const usersStore = new UsersStore(client);
    const templatesStore = new TemplatesStore(client, tagsStore, entitiesStore);
    const attachmentsStore = new AttachmentsStore(client);
    const postsStore = new PostsStore(
      client,
      commentsStore,
      tagsStore,
      entitiesStore,
      attachmentsStore,
      tagDatabase,
    );
    const answersStore = new AnswersStore(
      client,
      commentsStore,
      postsStore,
      attachmentsStore,
    );
    const collectionsStore = new CollectionsStore(
      client,
      postsStore,
      attachmentsStore,
    );
    const statsStore = new StatsStore(client);

    postsStore.setAnswersStore(answersStore);

    return new DatabaseQetaStore(
      postsStore,
      answersStore,
      commentsStore,
      collectionsStore,
      statsStore,
      tagsStore,
      usersStore,
      entitiesStore,
      templatesStore,
      attachmentsStore,
    );
  }

  async getPosts(
    user_ref: string,
    options: PostsQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: PostOptions,
  ): Promise<Posts> {
    return this.postsStore.getPosts(user_ref, options, filters, opts);
  }

  async getPost(
    user_ref: string,
    id: number,
    recordView?: boolean,
    options?: PostOptions,
  ): Promise<MaybePost> {
    return this.postsStore.getPost(user_ref, id, recordView, options);
  }

  async getPostByAnswerId(
    user_ref: string,
    answerId: number,
    recordView?: boolean,
    options?: PostOptions,
  ): Promise<MaybePost> {
    return this.postsStore.getPostByAnswerId(
      user_ref,
      answerId,
      recordView,
      options,
    );
  }

  async createPost(options: {
    user_ref: string;
    title: string;
    content: string;
    created: Date;
    author?: string;
    tags?: string[];
    entities?: string[];
    images?: number[];
    anonymous?: boolean;
    type?: PostType;
    headerImage?: string;
    url?: string;
    status?: PostStatus;
    opts?: PostOptions;
  }): Promise<Post> {
    return this.postsStore.createPost(options);
  }

  async updatePost(options: {
    user_ref: string;
    id: number;
    title?: string;
    content?: string;
    author?: string;
    tags?: string[];
    entities?: string[];
    images?: number[];
    headerImage?: string;
    url?: string;
    status?: PostStatus;
    opts?: PostOptions;
  }): Promise<MaybePost> {
    return this.postsStore.updatePost(options);
  }

  async deletePost(id: number, permanently?: boolean): Promise<boolean> {
    return this.postsStore.deletePost(id, permanently);
  }

  async votePost(
    user_ref: string,
    postId: number,
    score: number,
  ): Promise<boolean> {
    return this.postsStore.votePost(user_ref, postId, score);
  }

  async deletePostVote(user_ref: string, postId: number): Promise<boolean> {
    return this.postsStore.deletePostVote(user_ref, postId);
  }

  async favoritePost(user_ref: string, postId: number): Promise<boolean> {
    return this.postsStore.favoritePost(user_ref, postId);
  }

  async unfavoritePost(user_ref: string, postId: number): Promise<boolean> {
    return this.postsStore.unfavoritePost(user_ref, postId);
  }

  async getUsersWhoFavoritedPost(postId: number): Promise<string[]> {
    return this.postsStore.getUsersWhoFavoritedPost(postId);
  }

  async getAnswers(
    user_ref: string,
    options: AnswersQuery,
    filters?: PermissionCriteria<QetaFilters>,
    opts?: AnswerOptions,
  ): Promise<Answers> {
    return this.answersStore.getAnswers(user_ref, options, filters, opts);
  }

  async getAnswer(
    answerId: number,
    user_ref: string,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    return this.answersStore.getAnswer(answerId, user_ref, options);
  }

  async answerPost(
    user_ref: string,
    questionId: number,
    answer: string,
    created: Date,
    images?: number[],
    anonymous?: boolean,
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    return this.answersStore.answerPost(
      user_ref,
      questionId,
      answer,
      created,
      images,
      anonymous,
      options,
    );
  }

  async updateAnswer(
    user_ref: string,
    questionId: number,
    answerId: number,
    answer: string,
    author?: string,
    images?: number[],
    options?: AnswerOptions,
  ): Promise<MaybeAnswer> {
    return this.answersStore.updateAnswer(
      user_ref,
      questionId,
      answerId,
      answer,
      author,
      images,
      options,
    );
  }

  async deleteAnswer(id: number): Promise<boolean> {
    return this.answersStore.deleteAnswer(id);
  }

  async voteAnswer(
    user_ref: string,
    answerId: number,
    score: number,
  ): Promise<boolean> {
    return this.answersStore.voteAnswer(user_ref, answerId, score);
  }

  async deleteAnswerVote(user_ref: string, answerId: number): Promise<boolean> {
    return this.answersStore.deleteAnswerVote(user_ref, answerId);
  }

  async markAnswerCorrect(postId: number, answerId: number): Promise<boolean> {
    return this.answersStore.markAnswerCorrect(postId, answerId);
  }

  async markAnswerIncorrect(
    postId: number,
    answerId: number,
  ): Promise<boolean> {
    return this.answersStore.markAnswerIncorrect(postId, answerId);
  }

  async clickPost(user_ref: string, postId: number): Promise<void> {
    const vote = await this.postsStore.getPostVote(user_ref, postId);
    const score = (vote?.score || 0) + 1;
    await this.postsStore.votePost(user_ref, postId, score);
  }

  async commentPost(
    post_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybePost> {
    await this.commentsStore.commentPost(post_id, user_ref, content, created);
    return this.getPost(user_ref, post_id);
  }

  async commentAnswer(
    answer_id: number,
    user_ref: string,
    content: string,
    created: Date,
  ): Promise<MaybeAnswer> {
    await this.commentsStore.commentAnswer(
      answer_id,
      user_ref,
      content,
      created,
    );
    return this.getAnswer(answer_id, user_ref);
  }

  async updatePostComment(
    post_id: number,
    id: number,
    user_ref: string,
    content: string,
  ): Promise<MaybePost> {
    await this.commentsStore.updatePostComment(post_id, id, user_ref, content);
    return this.getPost(user_ref, post_id);
  }

  async updateAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
    content: string,
  ): Promise<MaybeAnswer> {
    await this.commentsStore.updateAnswerComment(
      answer_id,
      id,
      user_ref,
      content,
    );
    return this.getAnswer(answer_id, user_ref);
  }

  async deletePostComment(
    post_id: number,
    id: number,
    user_ref: string,
  ): Promise<MaybePost> {
    await this.commentsStore.deletePostComment(post_id, id);
    return this.getPost(user_ref, post_id);
  }

  async deleteAnswerComment(
    answer_id: number,
    id: number,
    user_ref: string,
  ): Promise<MaybeAnswer> {
    await this.commentsStore.deleteAnswerComment(answer_id, id);
    return this.getAnswer(answer_id, user_ref);
  }

  async getCollections(
    user_ref: string,
    options: PostsQuery,
    opts?: CollectionOptions,
  ): Promise<Collections> {
    return this.collectionsStore.getCollections(user_ref, options, opts);
  }

  async getCollection(
    user_ref: string,
    id: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection> {
    return this.collectionsStore.getCollection(user_ref, id, options);
  }

  async createCollection(options: {
    user_ref: string;
    title: string;
    description?: string;
    created: Date;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<Collection> {
    return this.collectionsStore.createCollection(
      options,
    ) as Promise<Collection>;
  }

  async updateCollection(options: {
    id: number;
    user_ref: string;
    title: string;
    description?: string;
    images?: number[];
    headerImage?: string;
    opts?: CollectionOptions;
  }): Promise<MaybeCollection> {
    return this.collectionsStore.updateCollection(options);
  }

  async deleteCollection(id: number): Promise<boolean> {
    return this.collectionsStore.deleteCollection(id);
  }

  async addPostToCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection> {
    return this.collectionsStore.addPostToCollection(
      user_ref,
      id,
      postId,
      options,
    );
  }

  async removePostFromCollection(
    user_ref: string,
    id: number,
    postId: number,
    options?: CollectionOptions,
  ): Promise<MaybeCollection> {
    return this.collectionsStore.removePostFromCollection(
      user_ref,
      id,
      postId,
      options,
    );
  }

  async getUsersForCollection(collectionId: number): Promise<string[]> {
    return this.collectionsStore.getUsersForCollection(collectionId);
  }

  async followCollection(
    user_ref: string,
    collectionId: number,
  ): Promise<boolean> {
    return this.collectionsStore.followCollection(user_ref, collectionId);
  }

  async unfollowCollection(
    user_ref: string,
    collectionId: number,
  ): Promise<boolean> {
    return this.collectionsStore.unfollowCollection(user_ref, collectionId);
  }

  async getUserCollections(
    user_ref: string,
    options?: CollectionOptions,
  ): Promise<UserCollectionsResponse> {
    return this.collectionsStore.getUserCollections(user_ref, options);
  }

  async getPostRank(
    collectionId: number,
    postId: number,
  ): Promise<number | null> {
    return this.collectionsStore.getPostRank(collectionId, postId);
  }

  async getTopRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    return this.collectionsStore.getTopRankedPostId(collectionId);
  }

  async getBottomRankedPostId(
    collectionId: number,
  ): Promise<CollectionPostRank | null> {
    return this.collectionsStore.getBottomRankedPostId(collectionId);
  }

  async getNextRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null> {
    return this.collectionsStore.getNextRankedPostId(collectionId, postId);
  }

  async getPreviousRankedPostId(
    collectionId: number,
    postId: number,
  ): Promise<CollectionPostRank | null> {
    return this.collectionsStore.getPreviousRankedPostId(collectionId, postId);
  }

  async updatePostRank(
    collectionId: number,
    postId: number,
    rank: number,
  ): Promise<void> {
    return this.collectionsStore.updatePostRank(collectionId, postId, rank);
  }

  async getTags(
    options?: { noDescription?: boolean; ids?: number[] } & TagsQuery,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<TagsResponse> {
    return this.tagsStore.getTags(options, filters);
  }

  async getTagExperts(tags: string[]): Promise<string[]> {
    return this.tagsStore.getTagExperts(tags);
  }

  async getTag(tag: string): Promise<TagResponse | null> {
    return this.tagsStore.getTag(tag);
  }

  async getTagById(id: number): Promise<TagResponse | null> {
    return this.tagsStore.getTagById(id);
  }

  async createTag(
    tag: string,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null> {
    return this.tagsStore.createTag(tag, description, experts);
  }

  async updateTag(
    id: number,
    description?: string,
    experts?: string[],
  ): Promise<TagResponse | null> {
    return this.tagsStore.updateTag(id, description, experts);
  }

  async deleteTag(id: number): Promise<boolean> {
    return this.tagsStore.deleteTag(id);
  }

  async getEntities(
    options?: { entityRefs?: string[] } & EntitiesQuery,
  ): Promise<EntitiesResponse> {
    return this.entitiesStore.getEntities(options);
  }

  async getEntity(entity_ref: string): Promise<EntityResponse | null> {
    return this.entitiesStore.getEntity(entity_ref);
  }

  async getUsers(
    options?: { entityRefs?: string[] } & UsersQuery,
  ): Promise<UsersResponse> {
    return this.usersStore.getUsers(options);
  }

  async getUser(user_ref: string): Promise<UserResponse | null> {
    return this.usersStore.getUser(user_ref);
  }

  async getUserTags(
    user_ref: string,
    filters?: PermissionCriteria<QetaFilters>,
  ): Promise<UserTagsResponse> {
    return this.tagsStore.getUserTags(user_ref, filters);
  }

  async followTag(user_ref: string, tag: string): Promise<boolean> {
    return this.tagsStore.followTag(user_ref, tag);
  }

  async unfollowTag(user_ref: string, tag: string): Promise<boolean> {
    return this.tagsStore.unfollowTag(user_ref, tag);
  }

  async getUserEntities(user_ref: string): Promise<UserEntitiesResponse> {
    return this.entitiesStore.getUserEntities(user_ref);
  }

  async followEntity(user_ref: string, entityRef: string): Promise<boolean> {
    return this.entitiesStore.followEntity(user_ref, entityRef);
  }

  async unfollowEntity(user_ref: string, entityRef: string): Promise<boolean> {
    return this.entitiesStore.unfollowEntity(user_ref, entityRef);
  }

  async getUsersForTags(tags: string[]): Promise<string[]> {
    return this.tagsStore.getUsersForTags(tags);
  }

  async getUsersForEntities(entityRefs: string[]): Promise<string[]> {
    return this.entitiesStore.getUsersForEntities(entityRefs);
  }

  async getFollowedUsers(user_ref: string): Promise<UserUsersResponse> {
    return this.usersStore.getFollowedUsers(user_ref);
  }

  async followUser(
    user_ref: string,
    followedUserRef: string,
  ): Promise<boolean> {
    return this.usersStore.followUser(user_ref, followedUserRef);
  }

  async unfollowUser(
    user_ref: string,
    followedUserRef: string,
  ): Promise<boolean> {
    return this.usersStore.unfollowUser(user_ref, followedUserRef);
  }

  async getGlobalStats(): Promise<GlobalStat[]> {
    return this.statsStore.getGlobalStats();
  }

  async getUserStats(user_ref: string): Promise<UserStat[]> {
    return this.statsStore.getUserStats(user_ref);
  }

  async getTemplates(): Promise<Templates> {
    return this.templatesStore.getTemplates();
  }

  async getTemplate(id: number): Promise<Template | null> {
    return this.templatesStore.getTemplate(id);
  }

  async createTemplate(options: {
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<Template> {
    return this.templatesStore.createTemplate(options);
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templatesStore.deleteTemplate(id);
  }

  async updateTemplate(options: {
    id: number;
    title: string;
    description: string;
    questionTitle?: string;
    questionContent?: string;
    tags?: string[];
    entities?: string[];
  }): Promise<Template | null> {
    return this.templatesStore.updateTemplate(options);
  }

  async getAIAnswer(postId: number): Promise<AIResponse | null> {
    return this.postsStore.getAIAnswer(postId);
  }

  async saveAIAnswer(postId: number, response: AIResponse): Promise<void> {
    return this.postsStore.saveAIAnswer(postId, response);
  }

  async deleteAIAnswer(postId: number): Promise<boolean> {
    return this.postsStore.deleteAIAnswer(postId);
  }

  async postAttachment({
    uuid,
    locationType,
    locationUri,
    extension,
    mimeType,
    binaryImage,
    path,
    creator,
  }: AttachmentParameters): Promise<Attachment> {
    return this.attachmentsStore.postAttachment({
      uuid,
      locationType,
      locationUri,
      extension,
      mimeType,
      binaryImage,
      path,
      creator,
    });
  }

  async getAttachment(uuid: string): Promise<Attachment | undefined> {
    return this.attachmentsStore.getAttachment(uuid);
  }

  async deleteAttachment(uuid: string): Promise<boolean> {
    return this.attachmentsStore.deleteAttachment(uuid);
  }

  async getDeletableAttachments(dayLimit: number): Promise<Attachment[]> {
    return this.attachmentsStore.getDeletableAttachments(dayLimit);
  }

  // Stats

  async getMostUpvotedPosts({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    return this.statsStore.getMostUpvotedPosts({ author, options });
  }

  async getTotalPosts({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    return this.statsStore.getTotalPosts({ author, options });
  }

  async getMostUpvotedAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    return this.statsStore.getMostUpvotedAnswers({ author, options });
  }

  async getMostUpvotedCorrectAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    return this.statsStore.getMostUpvotedCorrectAnswers({ author, options });
  }

  async getTotalAnswers({
    author,
    options,
  }: StatisticsRequestParameters): Promise<Statistic[]> {
    return this.statsStore.getTotalAnswers({ author, options });
  }

  async getCount(
    table: string,
    filters?: { author?: string; type?: PostType },
  ): Promise<number> {
    return this.statsStore.getCount(table, filters);
  }

  async saveGlobalStats(date: Date): Promise<void> {
    return this.statsStore.saveGlobalStats(date);
  }

  async saveUserStats(user: UserResponse, date: Date): Promise<void> {
    return this.statsStore.saveUserStats(user, date);
  }

  async getTotalViews(
    user_ref: string,
    lastDays?: number,
    excludeUser?: boolean,
  ): Promise<number> {
    return this.statsStore.getTotalViews(user_ref, lastDays, excludeUser);
  }

  async cleanStats(days: number, date: Date): Promise<void> {
    return this.statsStore.cleanStats(days, date);
  }

  async getUsersCount(): Promise<number> {
    return this.usersStore.getUsersCount();
  }

  async getFollowingUsers(user_ref: string): Promise<string[]> {
    return this.usersStore.getFollowingUsers(user_ref);
  }

  async getEntityLinks(): Promise<EntityLinks[]> {
    return this.entitiesStore.getEntityLinks();
  }

  async getComments(
    options?: { ids?: number[] },
    opts?: CommentOptions,
  ): Promise<QetaComment[]> {
    return this.commentsStore.getComments(options, opts);
  }

  async getComment(
    commentId: number,
    opts?: CommentOptions & { postId?: number; answerId?: number },
  ): Promise<QetaComment | null> {
    return this.commentsStore.getComment(commentId, opts);
  }
}
