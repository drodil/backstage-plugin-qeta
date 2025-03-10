/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConfigReader } from '@backstage/config';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import {
  mockServices,
  registerMswTestHooks,
} from '@backstage/backend-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Readable } from 'stream';
import { DefaultQetaCollatorFactory } from './DefaultQetaCollatorFactory';

const mockComments = [{ content: 'comment' }];
const mockAnswers = [
  {
    id: 1,
    content: 'answer 1',
    comments: mockComments,
  },
];
const mockPosts = {
  posts: [
    {
      id: 1,
      title: 'question1',
      content: 'question 1 content',
      answers: mockAnswers,
      comments: mockComments,
    },
  ],
  total: 1,
};
const mockCollections = {
  collections: [
    {
      id: 1,
      title: 'collection1',
      description: 'Test',
      created: new Date(),
      owner: 'user:default/john.doe',
    },
  ],
  total: 1,
};

describe('DefaultQetaCollatorFactory', () => {
  const config = new ConfigReader({});
  const mockDiscovery = mockServices.discovery.mock({
    getBaseUrl: jest.fn().mockResolvedValue('http://test-backend/api/qeta'),
  });
  const mockAuth = mockServices.auth.mock({
    getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'test_token' }),
  });
  const options = {
    discovery: mockDiscovery,
    logger: mockServices.logger.mock(),
    auth: mockAuth,
  };

  it('has expected type', () => {
    const factory = DefaultQetaCollatorFactory.fromConfig(config, options);
    expect(factory.type).toBe('qeta');
  });

  describe('getCollator', () => {
    let factory: DefaultQetaCollatorFactory;
    let collator: Readable;
    let lastRequest: any = null;

    const worker = setupServer();
    registerMswTestHooks(worker);

    beforeEach(async () => {
      factory = DefaultQetaCollatorFactory.fromConfig(config, options);
      collator = await factory.getCollator();
      lastRequest = null;

      worker.use(
        rest.post(
          'http://test-backend/api/qeta/posts/query',
          (req: any, res: any, ctx: any) => {
            lastRequest = req;
            return res(ctx.status(200), ctx.json(mockPosts));
          },
        ),
      );
      worker.use(
        rest.post(
          'http://test-backend/api/qeta/collections/query',
          (req: any, res: any, ctx: any) => {
            lastRequest = req;
            return res(ctx.status(200), ctx.json(mockCollections));
          },
        ),
      );
    });

    it('returns a readable stream', async () => {
      expect(collator).toBeInstanceOf(Readable);
    });

    it('runs against mock tools', async () => {
      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = await pipeline.execute();
      expect(mockDiscovery.getBaseUrl).toHaveBeenCalledWith('qeta');
      const totalDocuments =
        mockPosts.posts.length + mockCollections.collections.length;
      expect(documents).toHaveLength(totalDocuments);
      expect(lastRequest.headers.get('authorization')).toEqual(
        'Bearer test_token',
      );
    });

    it('non-authenticated backend', async () => {
      factory = DefaultQetaCollatorFactory.fromConfig(config, {
        discovery: mockDiscovery,
        logger: mockServices.logger.mock(),
      });
      collator = await factory.getCollator();

      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = await pipeline.execute();

      expect(mockDiscovery.getBaseUrl).toHaveBeenCalledWith('qeta');
      const totalDocuments =
        mockPosts.posts.length + mockCollections.collections.length;
      expect(documents).toHaveLength(totalDocuments);
      expect(lastRequest.headers.get('authorization')).toEqual(null);
    });

    it('authenticated backend', async () => {
      factory = DefaultQetaCollatorFactory.fromConfig(config, {
        discovery: mockDiscovery,
        logger: mockServices.logger.mock(),
        auth: mockServices.auth.mock({
          getPluginRequestToken: jest.fn().mockResolvedValue({ token: '1234' }),
        }),
      });
      collator = await factory.getCollator();

      const pipeline = TestPipeline.fromCollator(collator);
      const { documents } = await pipeline.execute();

      expect(mockDiscovery.getBaseUrl).toHaveBeenCalledWith('qeta');
      const totalDocuments =
        mockPosts.posts.length + mockCollections.collections.length;
      expect(documents).toHaveLength(totalDocuments);
      expect(lastRequest.headers.get('authorization')).toEqual('Bearer 1234');
    });
  });
});
