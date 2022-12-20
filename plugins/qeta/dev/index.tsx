import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { QetaPage, qetaPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(qetaPlugin)
  .addPage({
    element: <QetaPage />,
    title: 'Root Page',
    path: '/qeta',
  })
  .render();
