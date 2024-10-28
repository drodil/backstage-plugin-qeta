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
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts', {
        method: 'GET',
      });
    });

    it('should fetch posts with custom token', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ posts: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.getPosts({}, { token: 'token' });
      expect(result).toEqual({ posts: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledWith('http://example.com/posts', {
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
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
        { method: 'DELETE' },
      );
    });

    it('should handle errors', async () => {
      const mockResponse = { ok: false };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.deleteAnswer(1, 1);
      expect(result).toBe(false);
    });
  });
});
