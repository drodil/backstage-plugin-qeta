/*
 * SPDX-FileCopyrightText: Copyright 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  isResourcePermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import {
  ANSWER_RESOURCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  isQetaPermission,
  POST_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerAuthorConditionFactory,
  answerQuestionEntitiesConditionFactory,
  commentAuthorConditionFactory,
  createAnswerConditionalDecision,
  createCommentConditionalDecision,
  createPostConditionalDecision,
  postAuthorConditionFactory,
  postHasEntitiesConditionFactory,
} from '@drodil/backstage-plugin-qeta-backend';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { CatalogApi, CatalogClient } from '@backstage/catalog-client';

export class PermissionPolicy implements PermissionPolicy {
  private catalogApi: CatalogApi;

  constructor(private readonly auth: AuthService, discovery: DiscoveryService) {
    this.catalogApi = new CatalogClient({
      discoveryApi: discovery,
    });
  }

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Check that we are asking Q&A permissions
    if (!isQetaPermission(request.permission)) {
      return { result: AuthorizeResult.ALLOW };
    }

    // We cannot do anything without a user
    if (!user) {
      return { result: AuthorizeResult.DENY };
    }

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    // Needed to get the entities that the user owns so that it can be used
    // in the permissions
    // @ts-ignore
    const ownedEntities = (
      await this.catalogApi.getEntities(
        { filter: { 'spec.owner': user?.identity.ownershipEntityRefs } },
        { token },
      )
    ).items;

    if (
      request.permission.attributes.action === 'create' ||
      request.permission.attributes.action === 'read'
    ) {
      // Testing so that only own posts can be seen
      /**
       if (
        isResourcePermission(request.permission, POST_RESOURCE_TYPE) &&
        user
      ) {
        return createPostConditionalDecision(request.permission, {
          allOf: [
            postAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }
      */

      // Testing so that only posts with specific tag can be seen
      /**
       if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        return createPostConditionalDecision(request.permission, {
          allOf: [
            postHasTagsConditionFactory({
              tags: ['test'],
            }),
          ],
        });
      }
      */

      // Testing so that only posts with specific entity can be seen
      /**
       if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        return createPostConditionalDecision(request.permission, {
          allOf: [
            postHasEntitiesConditionFactory({
              entityRefs: ['component:default/test-component'],
            }),
          ],
        });
      }
      */
      // Disable posting
      /**
       if (isPermission(request.permission, qetaCreatePostPermission)) {
        return { result: AuthorizeResult.DENY };
      }
      */

      // Disable answering
      /**
       if (isPermission(request.permission, qetaCreateAnswerPermission)) {
        return { result: AuthorizeResult.DENY };
      }
       */

      // Disable commenting
      /** if (isPermission(request.permission, qetaCreateCommentPermission)) {
        return { result: AuthorizeResult.DENY };
      }*/
      return { result: AuthorizeResult.ALLOW };
    }

    if (!user) {
      return { result: AuthorizeResult.DENY };
    }

    // Allow updating and deleting only own posts/answers/comments
    if (
      request.permission.attributes.action === 'update' ||
      request.permission.attributes.action === 'delete'
    ) {
      // Can edit and delete only posts with specific tag
      /**
      if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        return createPostConditionalDecision(request.permission, {
          allOf: [
            postHasTagsConditionFactory({
              tags: ['test'],
            }),
          ],
        });
      }
      */

      // Testing that posts for only owned entities can be edited and deleted
      /* if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        const createEntitiesConditions = ownedEntities.map(e => {
          return postHasEntitiesConditionFactory({
            entityRefs: [stringifyEntityRef(e)],
          });
        });

        return createPostConditionalDecision(request.permission, {
          anyOf: [
            // Can edit and delete own questions
            postAuthorConditionFactory({
              userRef: user?.identity.userEntityRef,
            }),
            ...createEntitiesConditions,
          ],
        });
      }*/

      if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        return createPostConditionalDecision(request.permission, {
          anyOf: [
            // Can edit and delete own questions
            postAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
            // Each owned component should have it's own condition factory as the rule requires that the
            // question has ALL of the entityRefs attached passed in this array
            postHasEntitiesConditionFactory({
              entityRefs: ['component:default/test-component'],
            }),
          ],
        });
      }

      if (isResourcePermission(request.permission, ANSWER_RESOURCE_TYPE)) {
        return createAnswerConditionalDecision(request.permission, {
          anyOf: [
            answerAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
            answerQuestionEntitiesConditionFactory({
              entityRefs: ['component:default/test-component'],
            }),
          ],
        });
      }

      if (isResourcePermission(request.permission, COMMENT_RESOURCE_TYPE)) {
        return createCommentConditionalDecision(request.permission, {
          allOf: [
            commentAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }
    }

    return { result: AuthorizeResult.DENY };
  }
}
