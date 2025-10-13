# Extensions

Q&A provides possibility to extend functionalities with extensions.

## Markdown extensions

It's possible to add custom `remark` and `rehype` plugins to process markdown content.
To do that, you need to provide `markdown` configuration with `remarkPlugins` and/or `rehypePlugins` options in
the `QetaPage` component and `PostsTableCard` component properties.

```tsx
import rehypeMermaid from 'rehype-mermaid';

<QetaPage
  title="Questions and answers"
  subtitle="We have answers to everything!"
  headerType="See @ GitHub"
  headerTypeLink="https://github.com/drodil/backstage-plugin-qeta"
  headerTooltip="This is very cool plugin"
  introElement={<IntroElement />}
  rehypePlugins={[rehypeMermaid]}
/>;
```

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

- Available rehype plugins: https://github.com/rehypejs/rehype/blob/HEAD/doc/plugins.md#list-of-plugins
- Available remark plugins: https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins
