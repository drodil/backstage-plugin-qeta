// Url resolving logic from https://github.com/backstage/backstage/blob/master/packages/core-components/src/components/Link/Link.tsx

import { configApiRef, useApi } from '@backstage/core-plugin-api';

/**
 * Returns the app base url that could be empty if the Config API is not properly implemented.
 * The only cases there would be no Config API are in tests and in storybook stories, and in those cases, it's unlikely that callers would rely on this subpath behavior.
 */
export const useBaseUrl = () => {
  try {
    const config = useApi(configApiRef);
    return config.getOptionalString('app.baseUrl');
  } catch {
    return undefined;
  }
};
