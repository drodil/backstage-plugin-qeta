import { NotificationManager } from './NotificationManager';
import { NotificationService } from '@backstage/plugin-notifications-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Answer, Post } from '@drodil/backstage-plugin-qeta-common';
import { CatalogApi } from '@backstage/catalog-client';
import { mockServices } from '@backstage/backend-test-utils';
import { NotificationReceiversHandler } from '@drodil/backstage-plugin-qeta-node';

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;
  let mockLogger: LoggerService;
  let mockNotificationService: NotificationService;
  let mockCatalog: CatalogApi;
  let notificationReceivers: NotificationReceiversHandler;

  beforeEach(() => {
    mockLogger = { error: jest.fn() } as unknown as LoggerService;
    mockNotificationService = {
      send: jest.fn(),
    } as unknown as NotificationService;
    mockCatalog = {
      getEntityByRef: jest
        .fn()
        .mockResolvedValue({ metadata: { title: 'John Doe' } }),
    } as unknown as CatalogApi;
    notificationReceivers = {
      onNewPost: jest.fn().mockResolvedValue(['user3']),
      onNewPostComment: jest.fn().mockResolvedValue(['user3']),
      onNewAnswer: jest.fn().mockResolvedValue(['user3']),
      onAnswerComment: jest.fn().mockResolvedValue(['user3']),
      onCorrectAnswer: jest.fn().mockResolvedValue(['user3']),
      onMention: jest.fn().mockResolvedValue(['user3']),
    };

    notificationManager = new NotificationManager(
      mockLogger,
      mockCatalog,
      mockServices.auth.mock({
        getPluginRequestToken: jest
          .fn()
          .mockResolvedValue({ token: 'test_token' }),
      }),
      mockServices.rootConfig.mock(),
      mockNotificationService,
      mockServices.cache.mock(),
      notificationReceivers,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onNewPost', () => {
    const post: Partial<Post> = {
      id: 1,
      type: 'question',
      title: 'Test Post',
      entities: ['entity1'],
      comments: [],
    };

    it('should send notifications to the correct recipients', async () => {
      const followingUsers = ['user1', 'user2'];

      await notificationManager.onNewPost(
        'author',
        post as Post,
        followingUsers,
      );

      //
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description: 'John Doe asked a question: Test Post',
          link: '/qeta/questions/1',
          title: 'New question',
          topic: 'New question about entity',
        },
        recipients: {
          entityRef: ['entity1', 'user1', 'user2', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should send notifications to the correct recipients with custom route', async () => {
      // create new instance with custom config
      notificationManager = new NotificationManager(
        mockLogger,
        mockCatalog,
        mockServices.auth.mock({
          getPluginRequestToken: jest
            .fn()
            .mockResolvedValue({ token: 'test_token' }),
        }),
        mockServices.rootConfig({
          data: {
            qeta: {
              route: 'custom-qeta',
            },
          },
        }),
        mockNotificationService,
        mockServices.cache.mock(),
        notificationReceivers,
      );

      const followingUsers = ['user1', 'user2'];

      await notificationManager.onNewPost(
        'author',
        post as Post,
        followingUsers,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description: 'John Doe asked a question: Test Post',
          link: '/custom-qeta/questions/1',
          title: 'New question',
          topic: 'New question about entity',
        },
        recipients: {
          entityRef: ['entity1', 'user1', 'user2', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should log an error if notification sending fails', async () => {
      const followingUsers = ['user1', 'user2'];
      mockNotificationService.send = jest
        .fn()
        .mockRejectedValue(new Error('Notification error'));

      await notificationManager.onNewPost(
        'author',
        post as Post,
        followingUsers,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification for new question'),
      );
    });
  });

  describe('onNewPostComment', () => {
    const post: Partial<Post> = {
      id: 1,
      type: 'question',
      title: 'Test Post',
      author: 'author',
      entities: ['entity1'],
    };

    it('should send notifications to the correct recipients', async () => {
      const comment = 'Test comment';
      const followingUsers = ['user1', 'user2'];

      await notificationManager.onNewPostComment(
        'author',
        post as Post,
        comment,
        followingUsers,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description:
            'John Doe commented on question "Test Post": Test comment',
          link: '/qeta/questions/1',
          scope: 'question:comment:1',
          title: 'New comment on question',
          topic: 'New question comment',
        },
        recipients: {
          entityRef: ['author', 'entity1', 'user1', 'user2', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should log an error if notification sending fails', async () => {
      const comment = 'Test comment';
      const followingUsers = ['user1', 'user2'];
      mockNotificationService.send = jest
        .fn()
        .mockRejectedValue(new Error('Notification error'));

      await notificationManager.onNewPostComment(
        'author',
        post as Post,
        comment,
        followingUsers,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to send notification for new post comment',
        ),
      );
    });
  });

  describe('onNewAnswer', () => {
    const question: Partial<Post> = {
      id: 1,
      type: 'question',
      title: 'Test Question',
      author: 'author',
      entities: ['entity1'],
      comments: [],
    };
    const answer: Partial<Answer> = {
      id: 1,
      content: 'Test Answer',
      author: 'answerer',
      correct: false,
      postId: 1,
      comments: [],
    };

    it('should send notifications to the correct recipients', async () => {
      const followingUsers = ['user1', 'user2'];

      await notificationManager.onNewAnswer(
        'author',
        question as Post,
        answer as Answer,
        followingUsers,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description:
            'John Doe answered question "Test Question": Test Answer',
          link: '/qeta/questions/1#answer_1',
          scope: 'question:answer:1:author',
          title: 'New answer on question',
          topic: 'New answer on question',
        },
        recipients: {
          entityRef: ['author', 'entity1', 'user1', 'user2', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should log an error if notification sending fails', async () => {
      const followingUsers = ['user1', 'user2'];
      mockNotificationService.send = jest
        .fn()
        .mockRejectedValue(new Error('Notification error'));

      await notificationManager.onNewAnswer(
        'author',
        question as Post,
        answer as Answer,
        followingUsers,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification for new answer'),
      );
    });
  });

  describe('onAnswerComment', () => {
    const question: Partial<Post> = {
      id: 1,
      type: 'question',
      title: 'Test Question',
      author: 'author',
      entities: ['entity1'],
      comments: [],
    };
    const answer: Partial<Answer> = {
      id: 1,
      content: 'Test Answer',
      postId: 1,
      correct: false,
      author: 'answerer',
      comments: [],
    };

    it('should send notifications to the correct recipients', async () => {
      const comment = 'Test comment';
      const followingUsers = ['user1', 'user2'];

      await notificationManager.onAnswerComment(
        'author',
        question as Post,
        answer as Answer,
        comment,
        followingUsers,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description:
            'John Doe commented on answer to "Test Question": Test comment',
          link: '/qeta/questions/1#answer_1',
          scope: 'answer:comment:1',
          title: 'New comment on answer',
          topic: 'New answer comment',
        },
        recipients: {
          entityRef: ['answerer', 'entity1', 'user1', 'user2', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should log an error if notification sending fails', async () => {
      const comment = 'Test comment';
      const followingUsers = ['user1', 'user2'];
      mockNotificationService.send = jest
        .fn()
        .mockRejectedValue(new Error('Notification error'));

      await notificationManager.onAnswerComment(
        'author',
        question as Post,
        answer as Answer,
        comment,
        followingUsers,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to send notification for new answer comment',
        ),
      );
    });
  });

  describe('onCorrectAnswer', () => {
    const question: Partial<Post> = {
      id: 1,
      type: 'question',
      title: 'Test Question',
      author: 'author',
      entities: ['entity1'],
      comments: [],
    };
    const answer: Partial<Answer> = {
      id: 1,
      content: 'Test Answer',
      postId: 1,
      correct: false,
      author: 'answerer',
      comments: [],
    };

    it('should send notifications to the correct recipients', async () => {
      await notificationManager.onCorrectAnswer(
        'author',
        question as Post,
        answer as Answer,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description: 'John Doe marked answer as correct: Test Answer',
          link: '/qeta/questions/1#answer_1',
          scope: 'question:correct:1:answer',
          title: 'Correct answer on question',
          topic: 'Correct answer on question',
        },
        recipients: {
          entityRef: ['answerer', 'author', 'entity1', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should log an error if notification sending fails', async () => {
      mockNotificationService.send = jest
        .fn()
        .mockRejectedValue(new Error('Notification error'));

      await notificationManager.onCorrectAnswer(
        'author',
        question as Post,
        answer as Answer,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to send notification for correct answer',
        ),
      );
    });
  });

  describe('onMention', () => {
    const post: Partial<Post> = {
      id: 1,
      type: 'question',
      title: 'Test Post',
      author: 'author',
      entities: ['entity1'],
      comments: [],
    };

    it('should send notifications to the correct recipients', async () => {
      const mentions = ['@user1', '@user2'];
      const alreadySent = ['user1'];

      await notificationManager.onMention(
        'author',
        post as Post,
        mentions,
        alreadySent,
      );

      expect(mockNotificationService.send).toHaveBeenCalledWith({
        payload: {
          description: 'John Doe mentioned you in a post: Test Post',
          link: '/qeta/questions/1',
          scope: 'post:mention:1',
          title: 'New mention',
          topic: 'New mention',
        },
        recipients: {
          entityRef: ['user2', 'user3'],
          excludeEntityRef: 'author',
          type: 'entity',
        },
      });
    });

    it('should log an error if notification sending fails', async () => {
      const mentions = ['@user1', '@user2'];
      const alreadySent = ['user1'];
      mockNotificationService.send = jest
        .fn()
        .mockRejectedValue(new Error('Notification error'));

      await notificationManager.onMention(
        'author',
        post as Post,
        mentions,
        alreadySent,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification for mentions'),
      );
    });
  });
});
