import { createApiRef } from '@backstage/core-plugin-api';
import { QetaApi } from '@drodil/backstage-plugin-qeta-common';

export const qetaApiRef = createApiRef<QetaApi>({
  id: 'plugin.qeta.service',
});
