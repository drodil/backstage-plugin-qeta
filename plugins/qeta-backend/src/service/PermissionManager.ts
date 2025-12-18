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
  BackstageCredentials,
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

  public async getCredentials(
    request: Request<unknown>,
    allowServiceToken?: boolean,
  ) {
    const allow: Array<keyof BackstagePrincipalTypes> = allowServiceToken
      ? ['user', 'service']
      : ['user'];
    return await this.httpAuth.credentials(request, { allow });
  }

  public async getUsername(
    req: Request<unknown>,
    allowServiceToken?: boolean,
    creds?: BackstageCredentials,
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
      if (creds && this.auth.isPrincipal(creds, 'user')) {
        return creds.principal.userEntityRef;
      }

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
        if (creds && this.auth.isPrincipal(creds, 'service')) {
          return creds.principal.subject;
        }

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

  public async isModerator(
    req: Request<unknown>,
    options?: {
      credentials?: BackstageCredentials;
    },
  ): Promise<boolean> {
    try {
      const credentials =
        options?.credentials ??
        (await this.httpAuth.credentials(req, {
          allow: ['user', 'service'],
        }));
      if (!credentials) {
        return false;
      }

      // Service tokens are always moderators
      if (this.auth.isPrincipal(credentials, 'service')) {
        return true;
      }

      // Authorize moderator using permission framework
      if (this.permissions) {
        const result = await this.permissions.authorize(
          [
            {
              permission: qetaModeratePermission,
            },
          ],
          { credentials },
        );
        return result[0].result === AuthorizeResult.ALLOW;
      }

      if (!this.auth.isPrincipal(credentials, 'user')) {
        return false;
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
    options?: {
      resource?: QetaIdEntity | null;
      audit?: boolean;
      credentials?: BackstageCredentials;
    },
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

    if (!options?.resource) {
      if (options?.audit) {
        this.auditor?.createEvent({
          eventId: 'authorize',
          severityLevel: 'high',
          request,
          meta: {
            permission,
            resource: JSON.stringify(options?.resource),
            failure: 'Resource not found',
          },
        });
      }
      throw new NotFoundError('Resource not found');
    }

    const username = await this.getUsername(request, true, options.credentials);

    // Experts can edit and delete
    if (
      'experts' in options.resource &&
      Array.isArray(options.resource.experts) &&
      options.resource.experts.includes(username)
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    const moderator = await this.isModerator(request, options);
    if (moderator) {
      return { result: AuthorizeResult.ALLOW };
    }

    const globalEdit =
      this.config.getOptionalBoolean('qeta.allowGlobalEdits') ?? false;
    const editPermission = isUpdatePermission(permission);

    if (globalEdit && editPermission) {
      return { result: AuthorizeResult.ALLOW };
    }

    if ('author' in options.resource && username === options.resource.author) {
      return { result: AuthorizeResult.ALLOW };
    } else if (
      'owner' in options.resource &&
      username === options.resource.owner
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (options.audit) {
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
    queries: { permission: Permission; resource?: QetaIdEntity }[],
    options?: {
      audit?: boolean;
      credentials?: BackstageCredentials;
      throwOnDeny?: boolean;
    },
  ): Promise<DefinitivePolicyDecision[]> {
    if (!this.permissions) {
      return await Promise.all(
        queries.map(query =>
          this.authorizeWithoutPermissions(request, query.permission, {
            ...options,
            resource: query.resource,
          }),
        ),
      );
    }

    const moderator = await this.isModerator(request, options);

    if (moderator) {
      return queries.map(() => ({ result: AuthorizeResult.ALLOW }));
    }

    const credentials =
      options?.credentials ?? (await this.httpAuth.credentials(request));
    if (!credentials) {
      if (options?.audit) {
        queries.forEach(query => {
          this.auditor?.createEvent({
            eventId: 'authorize',
            severityLevel: 'high',
            request,
            meta: {
              permission: query.permission,
              failure: 'Unauthorized',
            },
          });
        });
      }
      throw new NotAllowedError('Unauthorized');
    }

    const requests = queries.map(query => {
      if (isResourcePermission(query.permission)) {
        if (!query.resource) {
          if (options?.audit) {
            this.auditor?.createEvent({
              eventId: 'authorize',
              severityLevel: 'high',
              request,
              meta: {
                permission: query.permission,
                resource: JSON.stringify(query.resource),
                failure: 'Resource not found',
              },
            });
          }
          throw new NotFoundError('Resource not found');
        }

        return {
          permission: query.permission,
          resourceRef: this.getResourceRef(query.resource),
        };
      }
      return { permission: query.permission };
    });

    const decisions = await this.permissions.authorize(requests, {
      credentials,
    });

    if (options?.audit) {
      decisions.forEach((decision, index) => {
        if (decision.result === AuthorizeResult.DENY) {
          this.auditor?.createEvent({
            eventId: 'authorize',
            severityLevel: 'high',
            request,
            meta: {
              permission: queries[index].permission,
              failure: 'Unauthorized',
            },
          });
        }
      });
    }

    const hasDeny = decisions.some(d => d.result === AuthorizeResult.DENY);
    if (hasDeny && (options?.throwOnDeny ?? true)) {
      throw new NotAllowedError('Unauthorized');
    }

    return decisions;
  }

  public async authorizeConditional(
    request: Request<unknown>,
    permission: Permission,
    options?: {
      allowServicePrincipal?: boolean;
      creds?: BackstageCredentials;
    },
  ): Promise<PolicyDecision> {
    if (!this.permissions) {
      return await this.authorizeWithoutPermissions(request, permission, {
        resource: null,
        audit: true,
        ...options,
      });
    }

    const allow: Array<keyof BackstagePrincipalTypes> =
      options?.allowServicePrincipal ? ['user', 'service'] : ['user'];
    const credentials =
      options?.creds ?? (await this.httpAuth.credentials(request, { allow }));

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
      options?.allowServicePrincipal &&
      this.auth.isPrincipal(credentials, 'service')
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    let decision: PolicyDecision = { result: AuthorizeResult.DENY };
    if (isResourcePermission(permission)) {
      const result = await this.permissions.authorizeConditional(
        [{ permission }],
        { credentials },
      );
      decision = result[0];
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
    queries: { permission: Permission; resource?: QetaIdEntity }[],
    options?: {
      credentials?: BackstageCredentials;
    },
  ): Promise<boolean[]> {
    try {
      const decisions = await this.authorize(request, queries, {
        audit: false,
        throwOnDeny: false,
        ...options,
      });
      return decisions.map(d => d.result === AuthorizeResult.ALLOW);
    } catch (e) {
      return queries.map(() => false);
    }
  }

  public async getAuthorizeConditions(
    request: Request<unknown>,
    permission: Permission,
    options?: {
      allowServicePrincipal?: boolean;
      creds?: BackstageCredentials;
    },
  ): Promise<PermissionCriteria<QetaFilters> | undefined> {
    if (!this.permissions) {
      return undefined;
    }

    const decision = await this.authorizeConditional(
      request,
      permission,
      options,
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
    if (isTag(resource)) {
      return `qeta:tag:${resource.id}`;
    }
    if (isComment(resource)) {
      return `qeta:comment:${resource.id}`;
    }
    if (isCollection(resource)) {
      return `qeta:collection:${resource.id}`;
    }
    throw new Error('Invalid resource type');
  }
}
