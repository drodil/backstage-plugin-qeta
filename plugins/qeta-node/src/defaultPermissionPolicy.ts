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
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import {
  ANSWER_RESOURCE_TYPE,
  COLLECTION_RESOUCE_TYPE,
  COMMENT_RESOURCE_TYPE,
  POST_RESOURCE_TYPE,
  qetaCreatePostReviewPermission,
  qetaDeletePostReviewPermission,
  qetaReadPostReviewPermission,
  TAG_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerAuthorConditionFactory,
  answerTagExpertConditionFactory,
  collectionOwnerConditionFactory,
  collectionTagExpertConditionFactory,
  commentAuthorConditionFactory,
  createAnswerConditionalDecision,
  createCollectionConditionalDecision,
  createCommentConditionalDecision,
  createPostConditionalDecision,
  postAuthorConditionFactory,
  postTagExpertConditionFactory,
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
      isPermission(request.permission, qetaReadPostReviewPermission) ||
      isPermission(request.permission, qetaCreatePostReviewPermission) ||
      isPermission(request.permission, qetaDeletePostReviewPermission)
    ) {
      return { result: AuthorizeResult.DENY };
    }

    if (
      request.permission.attributes.action === 'create' ||
      request.permission.attributes.action === 'read'
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (
      request.permission.attributes.action === 'update' ||
      request.permission.attributes.action === 'delete'
    ) {
      if (isResourcePermission(request.permission, POST_RESOURCE_TYPE)) {
        return createPostConditionalDecision(request.permission, {
          anyOf: [
            // Can edit and delete own questions
            postAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
            // Can edit and delete if tag expert
            postTagExpertConditionFactory({
              userRef: user.identity.userEntityRef,
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
            answerTagExpertConditionFactory({
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

      if (isResourcePermission(request.permission, COLLECTION_RESOUCE_TYPE)) {
        return createCollectionConditionalDecision(request.permission, {
          anyOf: [
            // Allow deleting and updating only own collections
            collectionOwnerConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
            // Allow deleting and updating if tag expert
            collectionTagExpertConditionFactory({
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
