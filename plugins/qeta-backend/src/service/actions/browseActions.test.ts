import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';
import { registerAddPostToCollectionAction } from './addPostToCollection';
import { registerGetCollectionsAction } from './getCollections';
import { registerGetPostsAction } from './getPosts';
import { registerGetTagsAction } from './getTags';

describe('Qeta browse actions', () => {
  let registeredActions: unknown[];
  let getTags: jest.SpyInstance;
  let getCollections: jest.SpyInstance;
  let getPosts: jest.SpyInstance;
  let addPostToCollection: jest.SpyInstance;

  beforeEach(() => {
    registeredActions = [];
    getTags = jest
      .spyOn(QetaClient.prototype, 'getTags')
      .mockResolvedValue({ tags: [], total: 0 });
    getCollections = jest
      .spyOn(QetaClient.prototype, 'getCollections')
      .mockResolvedValue({ collections: [], total: 0 });
    getPosts = jest
      .spyOn(QetaClient.prototype, 'getPosts')
      .mockResolvedValue({ posts: [], total: 0 });
    addPostToCollection = jest
      .spyOn(QetaClient.prototype, 'addPostToCollection')
      .mockResolvedValue({ id: 17, title: 'Runbooks', postsCount: 1 } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const register = (
    registration: (options: {
      actionsRegistry: ActionsRegistryService;
      discovery: DiscoveryService;
      auth: AuthService;
    }) => void,
  ) => {
    registration({
      actionsRegistry: {
        register: (action: unknown) => registeredActions.push(action),
      } as unknown as ActionsRegistryService,
      discovery: {} as DiscoveryService,
      auth: {
        getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'token' }),
      } as unknown as AuthService,
    });
  };

  const getAction = (name: string) => {
    const registration = registeredActions
      .map(
        action =>
          action as {
            name: string;
            action: (args: unknown) => Promise<unknown>;
          },
      )
      .find(action => action.name === name);

    if (!registration) {
      throw new Error(`${name} action was not registered`);
    }

    return registration.action;
  };

  it('gets tags with search and pagination filters', async () => {
    register(registerGetTagsAction);

    await getAction('get-tags')({
      input: { searchQuery: 'typescript', limit: 10, offset: 5 },
      credentials: {},
    });

    expect(getTags).toHaveBeenCalledWith(
      { searchQuery: 'typescript', limit: 10, offset: 5 },
      { token: 'token' },
    );
  });

  it('gets collections and optionally includes their posts', async () => {
    register(registerGetCollectionsAction);

    await getAction('get-collections')({
      input: { owner: 'user:default/alice', includePosts: true },
      credentials: {},
    });

    expect(getCollections).toHaveBeenCalledWith(
      { owner: 'user:default/alice', includePosts: true },
      { token: 'token' },
    );
  });

  it("filters posts to the current user's favorites", async () => {
    register(registerGetPostsAction);

    await getAction('get-posts')({
      input: { favorite: true },
      credentials: {},
    });

    expect(getPosts).toHaveBeenCalledWith(
      expect.objectContaining({ favorite: true }),
      { token: 'token' },
    );
  });

  it('adds an existing post to a collection', async () => {
    register(registerAddPostToCollectionAction);

    await getAction('add-post-to-collection')({
      input: { collectionId: 17, postId: 23 },
      credentials: {},
    });

    expect(addPostToCollection).toHaveBeenCalledWith(17, 23, {
      token: 'token',
    });
  });
});
