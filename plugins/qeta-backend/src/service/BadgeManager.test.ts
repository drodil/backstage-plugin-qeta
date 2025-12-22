import { BadgeManager } from './BadgeManager';
import { QetaStore } from '../database/QetaStore';
// Import BadgeEvaluator from qeta-node
import { BadgeEvaluator } from '@drodil/backstage-plugin-qeta-node';
// Import the constant to manipulate it
import { BADGE_EVALUATORS } from '../badges';

// Mock the whole module, returning an empty array for BADGE_EVALUATORS initially
jest.mock('../badges', () => ({
  BADGE_EVALUATORS: [],
}));

describe('BadgeManager', () => {
  const mockStore = {
    getPosts: jest.fn(),
    getAnswers: jest.fn(),
    awardBadge: jest.fn(),
    getUser: jest.fn(),
    createBadge: jest.fn(),
  } as unknown as QetaStore;

  const manager = new BadgeManager({ store: mockStore });

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
    // Push into the mocked array
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts: [{ id: 1 }] });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({ id: 1 });

    await manager.processUserBadges('user:default/test');

    expect(mockEvaluator.evaluate).toHaveBeenCalledWith({ id: 1 });
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'test-badge',
      'post:1',
    );
  });

  it('should process collection badges', async () => {
    const mockEvaluator = {
      key: 'collection-badge',
      evaluateCollection: jest.fn().mockResolvedValue(true),
    } as unknown as BadgeEvaluator;
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    const posts = [{ id: 1 }, { id: 2 }];
    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({ id: 1 });

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

    const posts = [{ id: 1 }];
    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({ id: 1 });

    await manager.processUserBadges('user:default/test');

    // Should not throw error and should call collection evaluator
    expect(mockEvaluator.evaluateCollection).toHaveBeenCalled();
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'collection-only-badge',
    );
  });

  it('should process user badges', async () => {
    const mockEvaluator = {
      key: 'user-badge',
      evaluateUser: jest.fn().mockResolvedValue(true),
    } as unknown as BadgeEvaluator;
    (BADGE_EVALUATORS as unknown as any[]).push(mockEvaluator);

    const user = { userRef: 'user:default/test' };
    (mockStore.getUser as jest.Mock).mockResolvedValue(user);
    (mockStore.getPosts as jest.Mock).mockResolvedValue({ posts: [] });
    (mockStore.getAnswers as jest.Mock).mockResolvedValue({ answers: [] });
    (mockStore.awardBadge as jest.Mock).mockResolvedValue({ id: 1 });

    await manager.processUserBadges('user:default/test');

    expect(mockEvaluator.evaluateUser).toHaveBeenCalledWith(user);
    expect(mockStore.awardBadge).toHaveBeenCalledWith(
      'user:default/test',
      'user-badge',
    );
  });
});
