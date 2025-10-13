# Extensions

Q&A provides possibility to extend functionalities with extensions.

## Markdown extensions

It's possible to add custom `remark` and `rehype` plugins to process markdown content.
To do that, you need to provide `markdown` configuration with `remarkPlugins` and/or `rehypePlugins` options in
the `QetaPage` component and `PostsTableCard` component properties.

In the new frontend system, this is made possible via `QetaMarkdownRehypePluginBlueprint` and `QetaMarkdownRemarkPluginBlueprint` extension points.

Example of adding `rehype-mermaid` plugin:

```tsx
import rehypeMermaid from 'rehype-mermaid';

const module = createFrontendModule({
  pluginId: 'qeta',
  extensions: [
    QetaMarkdownRehypePluginBlueprint.make({
      params: {
        plugin: rehypeMermaid,
      },
    }),
  ],
});
```
