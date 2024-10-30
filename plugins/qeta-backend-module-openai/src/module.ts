/*
 * SPDX-FileCopyrightText: Copyright 2024 OP Financial Group (https://op.fi). All Rights Reserved.
 * SPDX-License-Identifier: LicenseRef-OpAllRightsReserved
 */
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { qetaAIExtensionPoint } from '@drodil/backstage-plugin-qeta-node';
import { OpenAIHandler } from './OpenAIHandler';

export const qetaModuleOpenai = createBackendModule({
  pluginId: 'qeta',
  moduleId: 'openai',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        ai: qetaAIExtensionPoint,
      },
      async init({ logger, config, ai }) {
        const handler = new OpenAIHandler(logger, config);
        ai.setAIHandler(handler);
      },
    });
  },
});
