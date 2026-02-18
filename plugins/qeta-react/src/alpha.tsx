import { Pluggable } from 'unified';
import {
  coreExtensionData,
  createExtensionBlueprint,
  createExtensionDataRef,
} from '@backstage/frontend-plugin-api';

export const markdownPlugin = createExtensionDataRef<Pluggable>().with({
  id: 'qeta.markdown-plugin',
});

export const QetaMarkdownRehypePluginBlueprint = createExtensionBlueprint({
  kind: 'markdown-plugin',
  attachTo: { id: 'api:qeta/addons', input: 'rehypePlugins' },
  output: [markdownPlugin],
  factory(params: { plugin: Pluggable }) {
    return [markdownPlugin(params.plugin)];
  },
});

export const QetaMarkdownRemarkPluginBlueprint = createExtensionBlueprint({
  kind: 'markdown-plugin',
  attachTo: { id: 'api:qeta/addons', input: 'remarkPlugins' },
  output: [markdownPlugin],
  factory(params: { plugin: Pluggable }) {
    return [markdownPlugin(params.plugin)];
  },
});

export const QetaPageIntroElementBlueprint = createExtensionBlueprint({
  kind: 'intro-element',
  attachTo: { id: 'page:qeta', input: 'introElement' },
  output: [coreExtensionData.reactElement],
  factory(params: { element: JSX.Element }) {
    return [coreExtensionData.reactElement(params.element)];
  },
});

export const QetaPageHeaderElementBlueprint = createExtensionBlueprint({
  kind: 'header-element',
  attachTo: { id: 'page:qeta', input: 'headerElements' },
  output: [coreExtensionData.reactElement],
  factory(params: { element: JSX.Element }) {
    return [coreExtensionData.reactElement(params.element)];
  },
});
