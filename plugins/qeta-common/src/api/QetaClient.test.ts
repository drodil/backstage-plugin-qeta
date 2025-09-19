import { QetaClient, QetaError } from './QetaClient';

describe('QetaClient', () => {
  let client: QetaClient;
  const mockFetch = jest.fn();
  const mockDiscoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('http://example.com'),
  };

  beforeEach(() => {
    client = new QetaClient({
      discoveryApi: mockDiscoveryApi,
      fetchApi: { fetch: mockFetch },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should fetch posts', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ posts: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getPosts({});
      expect(result).toEqual({ posts: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts/query', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should fetch posts with custom token', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ posts: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getPosts({}, { token: 'token' });
      expect(result).toEqual({ posts: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts/query', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ errors: ['error'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(client.getPosts({})).rejects.toThrow(QetaError);
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const mockResponse = { json: jest.fn().mockResolvedValue({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.createPost({
        type: 'question',
        title: 'Test',
        content: 'Test content',
      });
      expect(result).toEqual({});
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          type: 'question',
          title: 'Test',
          content: 'Test content',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ errors: ['error'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        client.createPost({
          type: 'question',
          title: 'Test',
          content: 'Test content',
        }),
      ).rejects.toThrow(QetaError);
    });
  });

  describe('getTags', () => {
    it('should fetch tags', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ tags: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getTags();
      expect(result).toEqual({ tags: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/tags', {
        method: 'GET',
      });
    });
  });

  describe('votePostUp', () => {
    it('should upvote a post', async () => {
      const mockResponse = { json: jest.fn().mockResolvedValue({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.votePostUp(1);
      expect(result).toEqual({});
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/posts/1/upvote',
        { method: 'GET' },
      );
    });

    it('should handle errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ errors: ['error'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(client.votePostUp(1)).rejects.toThrow(QetaError);
    });
  });

  describe('markAnswerCorrect', () => {
    it('should mark an answer as correct', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.markAnswerCorrect(1, 1);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/posts/1/answers/1/correct',
        { method: 'GET' },
      );
    });

    it('should handle errors', async () => {
      const mockResponse = { ok: false };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.markAnswerCorrect(1, 1);
      expect(result).toBe(false);
    });
  });

  describe('getPost', () => {
    it('should fetch a single post', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ id: 1, title: 'Test Post' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getPost('1');
      expect(result).toEqual({ id: 1, title: 'Test Post' });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts/1', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ errors: ['error'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(client.getPost('1')).rejects.toThrow(QetaError);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deletePost(1);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts/1', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should delete a post with a reason', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deletePost(1, 'Reason for deletion');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts/1', {
        method: 'DELETE',
        body: JSON.stringify({ reason: 'Reason for deletion' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle errors', async () => {
      const mockResponse = { ok: false };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deletePost(1);
      expect(result).toBe(false);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ id: 1, title: 'Updated Post' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.updatePost('1', {
        type: 'question',
        title: 'Updated Post',
        content: 'Updated content',
      });
      expect(result).toEqual({ id: 1, title: 'Updated Post' });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts/1', {
        method: 'POST',
        body: JSON.stringify({
          type: 'question',
          title: 'Updated Post',
          content: 'Updated content',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should handle errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ errors: ['error'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        client.updatePost('1', {
          type: 'question',
          title: 'Updated Post',
          content: 'Updated content',
        }),
      ).rejects.toThrow(QetaError);
    });
  });

  describe('createAnswer', () => {
    it('should create an answer for a post', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ id: 1, content: 'Test Answer' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.postAnswer({
        postId: 1,
        answer: 'Test Answer',
      });
      expect(result).toEqual({ id: 1, content: 'Test Answer' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/posts/1/answers',
        {
          method: 'POST',
          body: JSON.stringify({ answer: 'Test Answer' }),
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    it('should handle errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ errors: ['error'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        client.postAnswer({ postId: 1, answer: 'Test Answer' }),
      ).rejects.toThrow(QetaError);
    });
  });

  describe('deleteAnswer', () => {
    it('should delete an answer', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deleteAnswer(1, 1);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/posts/1/answers/1',
        {
          method: 'DELETE',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    it('should delete an answer with a reason', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deleteAnswer(1, 1, 'Reason for deletion');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/posts/1/answers/1',
        {
          method: 'DELETE',
          body: JSON.stringify({ reason: 'Reason for deletion' }),
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    it('should handle errors', async () => {
      const mockResponse = { ok: false };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deleteAnswer(1, 1);
      expect(result).toBe(false);
    });
  });

  describe('getUsers', () => {
    it('should fetch users', async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({ users: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getUsers();
      expect(result).toEqual({ users: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/users', {
        method: 'GET',
      });
    });

    it('should handle 403', async () => {
      const mockResponse = {
        status: 403,
        json: jest.fn(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getUsers();
      expect(result).toEqual({ users: [], total: 0 });
    });
  });

  describe('getEntities', () => {
    it('should fetch entities', async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({ entities: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getEntities();
      expect(result).toEqual({ entities: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/entities', {
        method: 'GET',
      });
    });

    it('should handle 403', async () => {
      const mockResponse = {
        status: 403,
        json: jest.fn(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getEntities();
      expect(result).toEqual({ entities: [], total: 0 });
    });
  });

  describe('getTag', () => {
    it('should fetch a tag', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ tag: 'test' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getTag('test');
      expect(result).toEqual({ tag: 'test' });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/tags/test', {
        method: 'GET',
      });
    });

    it('should return null if not ok', async () => {
      const mockResponse = { ok: false, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getTag('test');
      expect(result).toBeNull();
    });
  });

  describe('followTag', () => {
    it('should follow a tag', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.followTag('tag1');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/tags/follow/tag1',
        { method: 'PUT' },
      );
    });
  });

  describe('unfollowTag', () => {
    it('should unfollow a tag', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.unfollowTag('tag1');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/tags/follow/tag1',
        { method: 'DELETE' },
      );
    });
  });

  describe('getFollowedTags', () => {
    it('should fetch followed tags', async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({ tags: ['tag1'], count: 1 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getFollowedTags();
      expect(result).toEqual({ tags: ['tag1'], count: 1 });
    });

    it('should handle 403', async () => {
      const mockResponse = { status: 403, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getFollowedTags();
      expect(result).toEqual({ tags: [], count: 0 });
    });
  });

  describe('getFollowedUsers', () => {
    it('should fetch followed users', async () => {
      const mockResponse = {
        status: 200,
        json: jest
          .fn()
          .mockResolvedValue({ followedUserRefs: ['user1'], count: 1 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getFollowedUsers();
      expect(result).toEqual({ followedUserRefs: ['user1'], count: 1 });
    });

    it('should handle 403', async () => {
      const mockResponse = { status: 403, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getFollowedUsers();
      expect(result).toEqual({ followedUserRefs: [], count: 0 });
    });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.followUser('user1');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/users/follow/user1',
        { method: 'PUT' },
      );
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.unfollowUser('user1');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/users/follow/user1',
        { method: 'DELETE' },
      );
    });
  });

  describe('getSuggestions', () => {
    it('should fetch suggestions', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ suggestions: ['foo'] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getSuggestions();
      expect(result).toEqual({ suggestions: ['foo'] });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/suggestions', {
        method: 'GET',
      });
    });
  });

  describe('getTemplates', () => {
    it('should fetch templates', async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({ templates: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getTemplates();
      expect(result).toEqual({ templates: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/templates', {
        method: 'GET',
      });
    });

    it('should handle 403', async () => {
      const mockResponse = { status: 403, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getTemplates();
      expect(result).toEqual({ templates: [], total: 0 });
    });
  });

  describe('getEntityLinks', () => {
    it('should fetch entity links successfully', async () => {
      const mockEntityLinks = [
        {
          entityRef: 'component:default/my-service',
          links: [
            {
              url: 'https://example.com/docs',
              title: 'Documentation',
              icon: 'docs',
              type: 'docs',
            },
            {
              url: 'https://github.com/example/repo',
              title: 'Source',
              icon: 'github',
              type: 'repo',
            },
          ],
        },
        {
          entityRef: 'api:default/my-api',
          links: [
            {
              url: 'https://api.example.com',
              title: 'API Endpoint',
              icon: 'api',
              type: 'api',
            },
          ],
        },
      ];

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(mockEntityLinks),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getEntityLinks();

      expect(result).toEqual(mockEntityLinks);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/entities/links',
        {
          method: 'GET',
        },
      );
    });

    it('should fetch entity links with custom token', async () => {
      const mockEntityLinks = [
        {
          entityRef: 'component:default/my-service',
          links: [
            {
              url: 'https://example.com/docs',
              title: 'Documentation',
              icon: 'docs',
              type: 'docs',
            },
          ],
        },
      ];

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(mockEntityLinks),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getEntityLinks({ token: 'custom-token' });

      expect(result).toEqual(mockEntityLinks);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/entities/links',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer custom-token',
          },
        },
      );
    });

    it('should return empty array when response status is 403 (forbidden)', async () => {
      const mockResponse = {
        status: 403,
        json: jest.fn(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getEntityLinks();

      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/entities/links',
        {
          method: 'GET',
        },
      );
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return empty array for empty response', async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue([]),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getEntityLinks();

      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/entities/links',
        {
          method: 'GET',
        },
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.getEntityLinks()).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://example.com/entities/links',
        {
          method: 'GET',
        },
      );
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(client.getEntityLinks()).rejects.toThrow('Invalid JSON');
    });
  });
});
