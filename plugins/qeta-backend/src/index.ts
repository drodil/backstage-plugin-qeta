/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export { qetaPlugin as default } from './plugin';

// DEPRECATED PERMISSION STUFF, TO BE REMOVED

export {
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  questionConditions,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createPostConditionalDecision,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerConditions,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createAnswerConditionalDecision,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  commentConditions,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createCommentConditionalDecision,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  tagConditions,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createTagConditionalDecision,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionConditions,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createCollectionConditionalDecision,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createPostPermissionRule,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createAnswerPermissionRule,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createCommentPermissionRule,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createTagPermissionRule,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  createCollectionPermissionRule,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  isPostAuthor,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postAuthorConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postHasTags,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postHasTagsConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postHasEntities,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postHasEntitiesConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postHasType,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  postHasTypeConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  permissionRules,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  isAnswerAuthor,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerAuthorConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerQuestionHasTags,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerQuestionTagsConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerQuestionEntitiesConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerQuestionHasEntityRefs,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  answerRules,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  isCommentAuthor,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  commentAuthorConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  commentRules,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  isTag,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  tagConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  tagRules,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  isCollectionOwner,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionOwnerConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionHasTags,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionHasTagsConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionHasEntities,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionHasEntitiesConditionFactory,
  /**
   * @deprecated Use the exports from '@drodil/backstage-plugin-qeta-node' instead
   */
  collectionRules,
} from '@drodil/backstage-plugin-qeta-node';
