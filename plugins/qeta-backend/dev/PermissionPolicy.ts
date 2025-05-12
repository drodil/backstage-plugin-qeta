/*
 * SPDX-FileCopyrightText: Copyright 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  isPermission,
  isResourcePermission,
  isUpdatePermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';
import {
  ANSWER_RESOURCE_TYPE,
  COLLECTION_RESOUCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  isQetaPermission,
  POST_RESOURCE_TYPE,
  qetaModeratePermission,
  TAG_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerAuthorConditionFactory,
  answerQuestionEntitiesConditionFactory,
  collectionOwnerConditionFactory,
  commentAuthorConditionFactory,
  createAnswerConditionalDecision,
  createCollectionConditionalDecision,
  createCommentConditionalDecision,
  createPostConditionalDecision,
  postAuthorConditionFactory,
  postHasEntitiesConditionFactory,
} from '@drodil/backstage-plugin-qeta-node';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { CatalogApi, CatalogClient } from '@backstage/catalog-client';

export class PermissionPolicy implements PermissionPolicy {
  // @ts-ignore
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

    // Moderator access using permission framework instead of config value
    if (isPermission(request.permission, qetaModeratePermission)) {
      if (user.identity.userEntityRef === 'user:development/guest') {
        return { result: AuthorizeResult.ALLOW };
      }
    }

    // @ts-ignore
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    // Needed to get the entities that the user owns so that it can be used
    // in the permissions.
    /*
    const ownedEntities = (
      await this.catalogApi.getEntities(
        {
          filter: { 'spec.owner': user.identity.ownershipEntityRefs },
          fields: ['kind', 'metadata.name', 'metadata.namespace'],
        },
        { token },
      )
    ).items;*/

    // TODO: Could utilize caching here so that these are not fetched on
    //       every authorization request. Adding CacheService is not too bit of
    //       a job.
    // @ts-ignore
    // const ownedEntityRefs = ownedEntities.map(e => stringifyEntityRef(e));
    const ownedEntityRefs = [];

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

      // Testing that it's possible to restrict viewing of
      // specific type of posts
      /**
       if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        // Can only view questions
        return createPostConditionalDecision(request.permission, {
          allOf: [postHasTypeConditionFactory({ type: 'question' })],
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

      // Disable tag creation
      /** if (isPermission(request.permission, qetaCreateTagPermission)) {
        return { result: AuthorizeResult.DENY };
      }*/

      // Disable collection creation
      /** if (isPermission(request.permission, qetaCreateCollectionPermission)) {
        return { result: AuthorizeResult.DENY };
      }*/

      // Allow reading only own collections
      /** if (isResourcePermission(request.permission, COLLECTION_RESOUCE_TYPE)) {
        return createCollectionConditionalDecision(request.permission, {
          allOf: [
            collectionOwnerConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }
          */

      // Allow reading only specific tags
      /** if (isResourcePermission(request.permission, TAG_RESOURCE_TYPE)) {
        return createTagConditionalDecision(request.permission, {
          allOf: [
            tagConditionFactory({
              tag: 'test',
            }),
          ],
        });
      } */

      // Test that only collections with specific tags can be seen
      /** if (isResourcePermission(request.permission, COLLECTION_RESOUCE_TYPE)) {
        return createCollectionConditionalDecision(request.permission, {
          allOf: [
            collectionHasTagsConditionFactory({
              tags: ['test'],
            }),
          ],
        });
      }*/

      // Test that only collections with specific entities can be seen
      /** if (isResourcePermission(request.permission, COLLECTION_RESOUCE_TYPE)) {
        return createCollectionConditionalDecision(request.permission, {
          allOf: [
            collectionHasEntitiesConditionFactory({
              entityRefs: ['group:default/child-group'],
            }),
          ],
        });
      } */

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

      // Testing that posts for only owned entities can be edited and deleted.
      // Same works for answers if needed.
      /**
       if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        const ownedEntitiesConditions = ownedEntityRefs.map(entityRef => {
          return postHasEntitiesConditionFactory({
            entityRefs: [entityRef],
          });
        });

        return createPostConditionalDecision(request.permission, {
          anyOf: [
            // Can edit and delete own questions
            postAuthorConditionFactory({
              userRef: user?.identity.userEntityRef,
            }),
            ...ownedEntitiesConditions,
          ],
        });
      }
       */

      // Testing that it's possible to restrict editing and deleting of
      // specific type of posts
      /**
       if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        // Can only edit or delete questions
        return createPostConditionalDecision(request.permission, {
          allOf: [postHasTypeConditionFactory({ type: 'question' })],
        });
      }
      */

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

      // Allow updating and deleting only own answers and answers with test-component in the question
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

      // Allow deleting and updating only own comments
      if (isResourcePermission(request.permission, COMMENT_RESOURCE_TYPE)) {
        return createCommentConditionalDecision(request.permission, {
          allOf: [
            commentAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }

      // Allow deleting and updating only own collections
      if (isResourcePermission(request.permission, COLLECTION_RESOUCE_TYPE)) {
        return createCollectionConditionalDecision(request.permission, {
          allOf: [
            collectionOwnerConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }

      // Allow updating any tag by anyone
      if (
        isResourcePermission(request.permission, TAG_RESOURCE_TYPE) &&
        isUpdatePermission(request.permission)
      ) {
        return { result: AuthorizeResult.ALLOW };
      }
    }

    return { result: AuthorizeResult.DENY };
  }
}
