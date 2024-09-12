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
  QUESTION_RESOURCE_TYPE,
} from '@drodil/backstage-plugin-qeta-common';
import {
  answerAuthorConditionFactory,
  answerQuestionEntitiesConditionFactory,
  commentAuthorConditionFactory,
  createAnswerConditionalDecision,
  createCommentConditionalDecision,
  createQuestionConditionalDecision,
  questionAuthorConditionFactory,
  questionHasEntitiesConditionFactory,
} from '@drodil/backstage-plugin-qeta-backend';

export class PermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Check that we are asking Q&A permissions
    if (!isQetaPermission(request.permission)) {
      return { result: AuthorizeResult.ALLOW };
    }

    if (
      request.permission.attributes.action === 'create' ||
      request.permission.attributes.action === 'read'
    ) {
      // Testing so that only own questions can be seen
      /**
       if (
        isResourcePermission(request.permission, QUESTION_RESOURCE_TYPE) &&
        user
      ) {
        return createQuestionConditionalDecision(request.permission, {
          allOf: [
            questionAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
          ],
        });
      }
      */

      // Testing so that only questions with specific tag can be seen
      /**
       if (isResourcePermission(request.permission, QUESTION_RESOURCE_TYPE)) {
        return createQuestionConditionalDecision(request.permission, {
          allOf: [
            questionHasTagsConditionFactory({
              tags: ['test'],
            }),
          ],
        });
      }
      */

      // Testing so that only questions with specific entity can be seen
      /**
       if (isResourcePermission(request.permission, QUESTION_RESOURCE_TYPE)) {
        return createQuestionConditionalDecision(request.permission, {
          allOf: [
            questionHasEntitiesConditionFactory({
              entityRefs: ['component:default/test-component'],
            }),
          ],
        });
      }
      */

      // Disable question asking
      /**
       if (isPermission(request.permission, qetaCreateQuestionPermission)) {
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

    // Allow updating and deleting only own questions/answers/comments
    if (
      request.permission.attributes.action === 'update' ||
      request.permission.attributes.action === 'delete'
    ) {
      // Can edit and delete only questions with specific tag
      /**
      if (isResourcePermission(request.permission, QUESTION_RESOURCE_TYPE)) {
        return createQuestionConditionalDecision(request.permission, {
          allOf: [
            questionHasTagsConditionFactory({
              tags: ['test'],
            }),
          ],
        });
      }
      */

      if (isResourcePermission(request.permission, QUESTION_RESOURCE_TYPE)) {
        return createQuestionConditionalDecision(request.permission, {
          anyOf: [
            // Can edit and delete own questions
            questionAuthorConditionFactory({
              userRef: user.identity.userEntityRef,
            }),
            // Each owned component should have it's own condition factory as the rule requires that the
            // question has ALL of the entityRefs attached passed in this array
            questionHasEntitiesConditionFactory({
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
