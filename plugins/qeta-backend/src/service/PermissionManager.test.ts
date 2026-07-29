import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { NotAllowedError } from '@backstage/errors';
import {
  qetaCreateTagPermission,
  qetaReadAnswerPermission,
  qetaReadCommentPermission,
  qetaReadPostPermission,
  qetaReadTagPermission,
} from '@drodil/backstage-plugin-qeta-common';
import { PermissionManager } from './PermissionManager';

describe('PermissionManager.getAuthorizeConditions', () => {
  const config = new ConfigReader({});
  const request = {} as any;

  const createManager = (decision: {
    result: AuthorizeResult;
    conditions?: any;
  }) => {
    const auth = {
      isPrincipal: jest.fn().mockReturnValue(false),
    } as any;

    const httpAuth = {
      credentials: jest.fn().mockResolvedValue({ principal: { type: 'user' } }),
    } as any;

    const userInfo = {} as any;

    const permissions = {
      authorizeConditional: jest.fn().mockResolvedValue([decision]),
    } as any;

    return new PermissionManager(config, auth, httpAuth, userInfo, permissions);
  };

  it('returns an empty tag filter when tag read permission is denied', async () => {
    const manager = createManager({ result: AuthorizeResult.DENY });

    const filter = await manager.getAuthorizeConditions(
      request,
      qetaReadTagPermission,
    );

    expect(filter).toEqual({
      property: 'tags.tag',
      values: [],
    });
  });

  it('returns an empty post filter when post read permission is denied', async () => {
    const manager = createManager({ result: AuthorizeResult.DENY });

    const filter = await manager.getAuthorizeConditions(
      request,
      qetaReadPostPermission,
    );

    expect(filter).toEqual({
      property: 'posts.id',
      values: [],
    });
  });

  it('returns an empty comment filter when comment read permission is denied', async () => {
    const manager = createManager({ result: AuthorizeResult.DENY });

    const filter = await manager.getAuthorizeConditions(
      request,
      qetaReadCommentPermission,
    );

    expect(filter).toEqual({
      property: 'comments.id',
      values: [],
    });
  });

  it('returns an empty answer filter when answer read permission is denied', async () => {
    const manager = createManager({ result: AuthorizeResult.DENY });

    const filter = await manager.getAuthorizeConditions(
      request,
      qetaReadAnswerPermission,
    );

    expect(filter).toEqual({
      property: 'answers.id',
      values: [],
    });
  });

  it('throws for non-read permissions when conditional authorization is denied', async () => {
    const manager = createManager({ result: AuthorizeResult.DENY });

    await expect(
      manager.getAuthorizeConditions(request, qetaCreateTagPermission),
    ).rejects.toBeInstanceOf(NotAllowedError);
  });

  it('returns transformed conditions when conditional decision is returned', async () => {
    const manager = createManager({
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        rule: 'IS_TAG',
        resourceType: 'qeta-tag',
        params: { tag: 'visible-tag' },
      },
    });

    const filter = await manager.getAuthorizeConditions(
      request,
      qetaReadTagPermission,
    );

    expect(filter).toEqual({
      property: 'tags.tag',
      values: ['visible-tag'],
    });
  });
});
