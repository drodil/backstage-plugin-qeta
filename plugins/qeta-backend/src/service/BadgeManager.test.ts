import { BadgeManager } from './BadgeManager';
import { QetaStore } from '../database/QetaStore';
import { BadgeEvaluator } from '@drodil/backstage-plugin-qeta-node';
import { BADGE_EVALUATORS } from '../badges';
import { NotificationManager } from './NotificationManager';

jest.mock('../badges', () => ({
  BADGE_EVALUATORS: [],
}));

describe('BadgeManager', () => {
  const mockStore = {
    getPosts: jest.fn(),
    getAnswers: jest.fn(),
    getCollections: jest.fn(),
    awardBadge: jest.fn(),
    getUser: jest.fn(),
    createBadge: jest.fn(),
  } as unknown as QetaStore;

  const mockNotificationManager = {
    onBadgeAwarded: jest.fn(),
  } as unknown as NotificationManager;

  const createManager = () =>
    new BadgeManager({
      store: mockStore,
      notificationManager: mockNotificationManager,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the array
    (BADGE_EVALUATORS as unknown as any[]).length = 0;
  });

  it('should process individual badges', async () => {
    const mockEvaluator = {
      key: 'test-badge',
      evaluate: jest.fn().mockResolvedValue(true),
    } as unknown as BadgeEvaluator;
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    const manager = createManager();

    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts: [{ id: 1 }] });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.getCollections as jest.Mock).mockResolvedValue({
      collections: [],
    });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({
      badge: { id: 1 },
      isNew: true,
    });

    await manager.processUserBadges('user:default/test');

    expect(mockEvaluator.evaluate).toHaveBeenCalledWith({ id: 1 });
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'test-badge',
      'post:1',
    );
    expect(mockNotificationManager.onBadgeAwarded).toHaveBeenCalled();
  });

  it('should process collection badges', async () => {
    const mockEvaluator = {
      key: 'collection-badge',
      evaluateCollection: jest.fn().mockResolvedValue(true),
    } as unknown as BadgeEvaluator;
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    const manager = createManager();

    const posts = [{ id: 1 }, { id: 2 }];
    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.getCollections as jest.Mock).mockResolvedValue({
      collections: [],
    });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({
      badge: { id: 1 },
      isNew: true,
    });

    await manager.processUserBadges('user:default/test');

    expect(mockEvaluator.evaluateCollection).toHaveBeenCalledWith(posts);
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'collection-badge',
    );
  });

  it('should handle optional evaluate method', async () => {
    const mockEvaluator = {
      key: 'collection-only-badge',
      evaluateCollection: jest.fn().mockResolvedValue(true),
      // evaluate is undefined
    } as unknown as BadgeEvaluator;
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    const manager = createManager();

    const posts = [{ id: 1 }];
    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.getCollections as jest.Mock).mockResolvedValue({
      collections: [],
    });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({
      badge: { id: 1 },
      isNew: false,
    });

    await manager.processUserBadges('user:default/test');

    // Should not throw error and should call collection evaluator
    expect(mockEvaluator.evaluateCollection).toHaveBeenCalled();
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'collection-only-badge',
    );
    // Should NOT send notification for existing badge
    expect(mockNotificationManager.onBadgeAwarded).not.toHaveBeenCalled();
  });

  it('should process user badges', async () => {
    const mockEvaluator = {
      key: 'user-badge',
      evaluateUser: jest.fn().mockResolvedValue(true),
    } as unknown as BadgeEvaluator;
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    const manager = createManager();

    const user = { userRef: 'user:default/test' };
    (mockStore.getUser as jest.Mock).mockResolvedValue(user);
    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts: [] });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.getCollections as jest.Mock).mockResolvedValue({
      collections: [],
    });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({
      badge: { id: 1 },
      isNew: true,
    });

    await manager.processUserBadges('user:default/test');

    expect(mockEvaluator.evaluateUser).toHaveBeenCalledWith(user);
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'user-badge',
    );
  });
});
