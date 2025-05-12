import { Request } from 'express';
import {
  AuthorizeResult,
  DefinitivePolicyDecision,
  isCreatePermission,
  isPermission,
  isReadPermission,
  isResourcePermission,
  isUpdatePermission,
  Permission,
  PermissionCriteria,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  AuthenticationError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';
import {
  AuditorService,
  AuthService,
  BackstagePrincipalTypes,
  HttpAuthService,
  PermissionsService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import {
  isAnswer,
  isCollection,
  isComment,
  isPost,
  isTag,
} from '../database/QetaStore.ts';
import {
  qetaCreateTagPermission,
  QetaIdEntity,
  qetaModeratePermission,
} from '@drodil/backstage-plugin-qeta-common';
import { Config } from '@backstage/config';
import { QetaFilters, transformConditions } from './util.ts';

export class PermissionManager {
  constructor(
    private readonly config: Config,
    private readonly auth: AuthService,
    private readonly httpAuth: HttpAuthService,
    private readonly userInfo: UserInfoService,
    private readonly permissions?: PermissionsService,
    private readonly auditor?: AuditorService,
  ) {}

  public async getUsername(
    req: Request<unknown>,
    allowServiceToken?: boolean,
  ): Promise<string> {
    const allowMetadataInput = this.config.getOptionalBoolean(
      'qeta.allowMetadataInput',
    );

    if (allowMetadataInput && req.body.user) {
      return req.body.user;
    } else if (allowMetadataInput && req.get('x-qeta-user')) {
      return req.get('x-qeta-user')!;
    }

    try {
      const credentials = await this.httpAuth.credentials(req, {
        allow: ['user'],
      });
      if (credentials) {
        return credentials.principal.userEntityRef;
      }
    } catch (_) {
      // NOOP
    }

    if (allowServiceToken) {
      try {
        const credentials = await this.httpAuth.credentials(req, {
          allow: ['service'],
        });
        if (credentials) {
          return credentials.principal.subject;
        }
      } catch (_) {
        // NOOP
      }
    }

    const allowAnonymous = this.config.getOptionalBoolean(
      'qeta.allowAnonymous',
    );

    if (allowAnonymous) {
      return 'user:default/guest';
    }

    throw new AuthenticationError(
      `Missing or invalid token in 'authorization' header`,
    );
  }

  public async isModerator(req: Request<unknown>): Promise<boolean> {
    try {
      const credentials = await this.httpAuth.credentials(req, {
        allow: ['user', 'service'],
      });
      if (!credentials) {
        return false;
      }

      // Service tokens are always moderators
      if (credentials.principal.type === 'service') {
        return true;
      }

      // Authorize moderator using permission framework
      if (this.permissions) {
        const result = await this.permissions.authorize(
          [{ permission: qetaModeratePermission }],
          { credentials },
        );
        return result[0].result === AuthorizeResult.ALLOW;
      }

      // Authorize moderator using config
      const username = credentials.principal.userEntityRef;
      const user = await this.userInfo.getUserInfo(credentials);

      const ownership: string[] = user?.ownershipEntityRefs ?? [];
      ownership.push(username);

      const moderators =
        this.config.getOptionalStringArray('qeta.moderators') ?? [];
      return moderators.some((m: string) => ownership.includes(m));
    } catch (_) {
      return false;
    }
  }

  public async authorizeWithoutPermissions(
    request: Request<unknown>,
    permission: Permission,
    resource?: QetaIdEntity | null,
    audit?: boolean,
  ): Promise<DefinitivePolicyDecision> {
    const readPermission = isReadPermission(permission);
    const createPermission = isCreatePermission(permission);

    if (isPermission(permission, qetaCreateTagPermission)) {
      return this.config.getOptionalBoolean('qeta.tags.allowCreation') ?? true
        ? { result: AuthorizeResult.ALLOW }
        : { result: AuthorizeResult.DENY };
    }

    if (readPermission || createPermission) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (!resource) {
      if (audit) {
        this.auditor?.createEvent({
          eventId: 'authorize',
          severityLevel: 'high',
          request,
          meta: {
            permission,
            resource,
            failure: 'Resource not found',
          },
        });
      }
      throw new NotFoundError('Resource not found');
    }

    const moderator = await this.isModerator(request);

    if (moderator) {
      return { result: AuthorizeResult.ALLOW };
    }

    const globalEdit =
      this.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;
    const editPermission = isUpdatePermission(permission);

    if (globalEdit && editPermission) {
      return { result: AuthorizeResult.ALLOW };
    }

    const username = await this.getUsername(request);
    if ('author' in resource && username === resource.author) {
      return { result: AuthorizeResult.ALLOW };
    } else if ('owner' in resource && username === resource.owner) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (audit) {
      this.auditor?.createEvent({
        eventId: 'authorize',
        severityLevel: 'high',
        request,
        meta: {
          permission,
          failure: 'Unauthorized',
        },
      });
    }

    return { result: AuthorizeResult.DENY };
  }

  public async authorize(
    request: Request<unknown>,
    permission: Permission,
    resource?: QetaIdEntity | null,
    audit?: boolean,
  ): Promise<DefinitivePolicyDecision> {
    if (!this.permissions) {
      return await this.authorizeWithoutPermissions(
        request,
        permission,
        resource,
        audit,
      );
    }

    const credentials = await this.httpAuth.credentials(request);
    if (!credentials) {
      if (audit) {
        this.auditor?.createEvent({
          eventId: 'authorize',
          severityLevel: 'high',
          request,
          meta: {
            permission,
            failure: 'Unauthorized',
          },
        });
      }
      throw new NotAllowedError('Unauthorized');
    }

    let decision: DefinitivePolicyDecision = { result: AuthorizeResult.DENY };
    if (isResourcePermission(permission)) {
      if (!resource) {
        if (audit) {
          this.auditor?.createEvent({
            eventId: 'authorize',
            severityLevel: 'high',
            request,
            meta: {
              permission,
              resource,
              failure: 'Resource not found',
            },
          });
        }
        throw new NotFoundError('Resource not found');
      }

      const resourceRef = this.getResourceRef(resource);

      decision = (
        await this.permissions.authorize([{ permission, resourceRef }], {
          credentials,
        })
      )[0];
    } else {
      decision = (
        await this.permissions.authorize([{ permission }], {
          credentials,
        })
      )[0];
    }

    if (decision.result === AuthorizeResult.DENY) {
      if (audit) {
        this.auditor?.createEvent({
          eventId: 'authorize',
          severityLevel: 'high',
          request,
          meta: {
            permission,
            failure: 'Unauthorized',
          },
        });
      }
      throw new NotAllowedError('Unauthorized');
    }
    return decision;
  }

  public async authorizeConditional(
    request: Request<unknown>,
    permission: Permission,
    allowServicePrincipal?: boolean,
  ): Promise<PolicyDecision> {
    if (!this.permissions) {
      return await this.authorizeWithoutPermissions(
        request,
        permission,
        null,
        true,
      );
    }

    const allow: Array<keyof BackstagePrincipalTypes> = allowServicePrincipal
      ? ['user', 'service']
      : ['user'];
    const credentials = await this.httpAuth.credentials(request, { allow });

    if (!credentials) {
      this.auditor?.createEvent({
        eventId: 'authorize',
        severityLevel: 'high',
        request,
        meta: {
          permission,
          failure: 'Unauthorized',
        },
      });
      throw new NotAllowedError('Unauthorized');
    }

    if (
      allowServicePrincipal &&
      this.auth.isPrincipal(credentials, 'service')
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    let decision: PolicyDecision = { result: AuthorizeResult.DENY };
    if (isResourcePermission(permission)) {
      decision = (
        await this.permissions.authorizeConditional([{ permission }], {
          credentials,
        })
      )[0];
    }

    if (decision.result === AuthorizeResult.DENY) {
      this.auditor?.createEvent({
        eventId: 'authorize',
        severityLevel: 'high',
        request,
        meta: {
          permission,
          failure: 'Unauthorized',
        },
      });
      throw new NotAllowedError('Unauthorized');
    }
    return decision;
  }

  public async authorizeBoolean(
    request: Request<unknown>,
    permission: Permission,
    resource?: QetaIdEntity | null,
  ): Promise<boolean> {
    try {
      const res = await this.authorize(request, permission, resource, false);
      return res.result === AuthorizeResult.ALLOW;
    } catch (e) {
      return false;
    }
  }

  public async getAuthorizeConditions(
    request: Request<unknown>,
    permission: Permission,
    allowServicePrincipal?: boolean,
  ): Promise<PermissionCriteria<QetaFilters> | undefined> {
    if (!this.permissions) {
      return undefined;
    }

    const decision = await this.authorizeConditional(
      request,
      permission,
      allowServicePrincipal,
    );
    if (decision.result === AuthorizeResult.CONDITIONAL) {
      return transformConditions(decision.conditions);
    }
    return undefined;
  }

  private getResourceRef(resource: QetaIdEntity) {
    if (isPost(resource)) {
      return `qeta:post:${resource.id}`;
    }
    if (isAnswer(resource)) {
      return `qeta:answer:${resource.id}`;
    }
    if (isComment(resource)) {
      return `qeta:comment:${resource.id}`;
    }
    if (isTag(resource)) {
      return `qeta:tag:${resource.id}`;
    }
    if (isCollection(resource)) {
      return `qeta:collection:${resource.id}`;
    }
    throw new Error('Invalid resource type');
  }
}
