import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { PostType } from '@drodil/backstage-plugin-qeta-common';

/**
 * Returns whether history / revision tracking is enabled for the given
 * content type (article, question, link).
 *
 * Reads from `qeta.history.enabled` and `qeta.history.enabledContent` in
 * the app config.
 */
export const useHistoryEnabled = (postType: PostType): boolean => {
  const configApi = useApi(configApiRef);
  const enabled = configApi.getOptionalBoolean('qeta.history.enabled') ?? false;
  if (!enabled) {
    return false;
  }
  const enabledContent = configApi.getOptionalStringArray(
    'qeta.history.enabledContent',
  ) ?? ['article'];
  return enabledContent.includes(postType);
};
