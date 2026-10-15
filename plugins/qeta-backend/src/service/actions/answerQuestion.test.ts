import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { QetaClient } from '@drodil/backstage-plugin-qeta-common';
import { registerAnswerQuestionAction } from './answerQuestion';

describe('answer-question action', () => {
  let action: (args: unknown) => Promise<unknown>;
  let postAnswer: jest.SpyInstance;
  let postAttachment: jest.SpyInstance;

  beforeEach(() => {
    const registeredActions: unknown[] = [];
    postAnswer = jest
      .spyOn(QetaClient.prototype, 'postAnswer')
      .mockResolvedValue({ id: 456 } as never);
    postAttachment = jest
      .spyOn(QetaClient.prototype, 'postAttachment')
      .mockResolvedValue({ id: 123 } as never);

    registerAnswerQuestionAction({
      actionsRegistry: {
        register: (registeredAction: unknown) =>
          registeredActions.push(registeredAction),
      } as unknown as ActionsRegistryService,
      auth: {
        getPluginRequestToken: jest.fn().mockResolvedValue({ token: 'token' }),
      } as unknown as AuthService,
      discovery: {} as DiscoveryService,
    });

    const registeredAction = registeredActions[0] as {
      action: (args: unknown) => Promise<unknown>;
    };
    action = registeredAction.action;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads base64 images and attaches them to the answer', async () => {
    await action({
      input: {
        postId: 42,
        answer: 'Answer content',
        images: [{ base64: 'YW5zd2VyIGltYWdl', mimeType: 'image/png' }],
      },
      credentials: {},
    });

    expect(postAnswer).toHaveBeenCalledWith(
      {
        postId: 42,
        answer: 'Answer content',
        images: [123],
      },
      { token: 'token' },
    );
    const uploadedImage = postAttachment.mock.calls[0][0] as Blob;
    expect(await uploadedImage.text()).toBe('answer image');
    expect(uploadedImage.type).toBe('image/png');
  });
});
