import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';
import { registerPostActions } from './createPost';

describe('post creation actions', () => {
  let registeredActions: unknown[];
  let createPost: jest.SpyInstance;
  let addPostToCollection: jest.SpyInstance;
  let postAttachment: jest.SpyInstance;

  beforeEach(() => {
    registeredActions = [];
    createPost = jest
      .spyOn(QetaClient.prototype, 'createPost')
      .mockResolvedValue({ id: 123 } as never);
    addPostToCollection = jest
      .spyOn(QetaClient.prototype, 'addPostToCollection')
      .mockResolvedValue({} as never);
    postAttachment = jest
      .spyOn(QetaClient.prototype, 'postAttachment')
      .mockResolvedValue({
        id: 10,
        locationUri: '/attachments/image-10',
      } as never);

    registerPostActions({
      actionsRegistry: {
        register: (action: unknown) => registeredActions.push(action),
      } as unknown as ActionsRegistryService,
      auth: {
        getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'token' }),
      } as unknown as AuthService,
      discovery: {} as DiscoveryService,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getAction = (name: string) => {
    const action = registeredActions
      .map(
        registration =>
          registration as {
            name: string;
            action: (args: unknown) => Promise<unknown>;
          },
      )
      .find(registration => registration.name === name);

    if (!action) {
      throw new Error(`${name} action was not registered`);
    }

    return action.action;
  };

  it('creates a draft question and links it to the requested collection', async () => {
    const action = getAction('ask-question');

    await action({
      input: {
        title: 'Draft question',
        content: 'Question content',
        draft: true,
        collectionId: 7,
        images: [
          {
            base64: 'cXVlc3Rpb24gaW1hZ2U=',
            mimeType: 'image/png',
          },
        ],
        headerImage: 'https://example.com/question.png',
      },
      credentials: {},
    });

    expect(createPost).toHaveBeenCalledWith(
      {
        title: 'Draft question',
        content: 'Question content',
        images: [10],
        headerImage: 'https://example.com/question.png',
        type: 'question',
        status: 'draft',
      },
      { token: 'token' },
    );
    expect(addPostToCollection).toHaveBeenCalledWith(7, 123, {
      token: 'token',
    });
    const uploadedImage = postAttachment.mock.calls[0][0] as Blob;
    expect(await uploadedImage.text()).toBe('question image');
    expect(uploadedImage.type).toBe('image/png');
    expect(postAttachment).toHaveBeenCalledWith(uploadedImage, undefined, {
      token: 'token',
    });
  });

  it('creates a draft article and links it to the requested collection', async () => {
    const action = getAction('write-article');

    await action({
      input: {
        title: 'Draft article',
        content: 'Article content',
        draft: true,
        collectionId: 9,
        images: [
          {
            base64: 'YXJ0aWNsZSBpbWFnZQ==',
            mimeType: 'image/jpeg',
          },
        ],
        headerImage: {
          base64: 'aGVhZGVyIGltYWdl',
          mimeType: 'image/png',
        },
        url: 'https://example.com/source',
      },
      credentials: {},
    });

    expect(createPost).toHaveBeenCalledWith(
      {
        title: 'Draft article',
        content: 'Article content',
        images: [10, 10],
        headerImage: '/attachments/image-10',
        url: 'https://example.com/source',
        type: 'article',
        status: 'draft',
      },
      { token: 'token' },
    );
    expect(addPostToCollection).toHaveBeenCalledWith(9, 123, {
      token: 'token',
    });
    expect(postAttachment).toHaveBeenCalledTimes(2);
  });

  it('creates a draft link and uses its content URL as the link destination', async () => {
    const action = getAction('post-link');

    await action({
      input: {
        title: 'Useful link',
        content: 'https://example.com',
        draft: true,
        collectionId: 12,
        images: [
          {
            base64: 'bGluayBpbWFnZQ==',
            mimeType: 'image/gif',
          },
        ],
        headerImage: 'https://example.com/preview.png',
      },
      credentials: {},
    });

    expect(createPost).toHaveBeenCalledWith(
      {
        title: 'Useful link',
        content: 'https://example.com',
        images: [10],
        headerImage: 'https://example.com/preview.png',
        url: 'https://example.com',
        type: 'link',
        status: 'draft',
      },
      { token: 'token' },
    );
    expect(addPostToCollection).toHaveBeenCalledWith(12, 123, {
      token: 'token',
    });
  });

  it('creates a published article without adding it to a collection by default', async () => {
    const action = getAction('write-article');

    await action({
      input: {
        title: 'Published article',
        content: 'Article content',
      },
      credentials: {},
    });

    expect(createPost).toHaveBeenCalledWith(
      {
        title: 'Published article',
        content: 'Article content',
        type: 'article',
        status: 'active',
      },
      { token: 'token' },
    );
    expect(addPostToCollection).not.toHaveBeenCalled();
  });

  it('rejects invalid base64 image data before creating the post', async () => {
    const action = getAction('write-article');

    await expect(
      action({
        input: {
          title: 'Invalid image',
          content: 'Article content',
          images: [{ base64: 'bad!', mimeType: 'image/png' }],
        },
        credentials: {},
      }),
    ).rejects.toThrow('Invalid base64 image data');

    expect(postAttachment).not.toHaveBeenCalled();
    expect(createPost).not.toHaveBeenCalled();
  });
});
