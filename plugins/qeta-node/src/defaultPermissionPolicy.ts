/*
 * SPDX-FileCopyrightText: Copyright 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  isResourcePermission,
  isUpdatePermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import {
  ANSWER_RESOURCE_TYPE,
  COLLECTION_RESOUCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  POST_RESOURCE_TYPE,
  TAG_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerAuthorConditionFactory,
  collectionOwnerConditionFactory,
  commentAuthorConditionFactory,
  createAnswerConditionalDecision,
  createCollectionConditionalDecision,
  createCommentConditionalDecision,
  createPostConditionalDecision,
  postAuthorConditionFactory,
} from '@drodil/backstage-plugin-qeta-node';
import { Config } from '@backstage/config';

export class DefaultQetaPermissionPolicy implements PermissionPolicy {
  constructor(private readonly config?: Config) {}

  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // We cannot do anything without a user
    if (!user) {
      return { result: AuthorizeResult.DENY };
    }

    // Moderators can modify anything
    const moderators =
      this.config?.getOptionalStringArray('qeta.moderators') ?? [];
    if (
      moderators.includes(user.identity.userEntityRef) ||
      user.identity.ownershipEntityRefs.some(ref => moderators.includes(ref))
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (
      request.permission.attributes.action === 'create' ||
      request.permission.attributes.action === 'read'
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Allow updating and deleting only own posts/answers/comments
    if (
      request.permission.attributes.action === 'update' ||
      request.permission.attributes.action === 'delete'
    ) {
      if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        return createPostConditionalDecision(request.permission, {
          allOf: [
            // Can edit and delete own questions
            postAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }

      if (isResourcePermission(request.permission, ANSWER_RESOURCE_TYPE)) {
        return createAnswerConditionalDecision(request.permission, {
          allOf: [
            answerAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
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
