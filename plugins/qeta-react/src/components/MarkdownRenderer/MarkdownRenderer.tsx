import { Children, lazy, PropsWithChildren, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { MarkdownHooks } from 'react-markdown';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ButtonIcon, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import {
  findEntityMentions,
  findTagMentions,
} from '@drodil/backstage-plugin-qeta-common';
import gfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeToc, { HeadingNode, TextNode } from '@jsdevtools/rehype-toc';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useIsDarkTheme } from '../../hooks/useIsDarkTheme';
import { RiFileCopyLine, RiLinksLine } from '@remixicon/react';
import { useApi } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import GithubSlugger from 'github-slugger';
import { HtmlElementNode } from '@jsdevtools/rehype-toc/lib/types';
import { find } from 'unist-util-find';
import { useQetaContext } from '../QetaContext';
import styles from './MarkdownRenderer.module.css';
import { toastApiRef } from '@backstage/frontend-plugin-api';

const TagChip = lazy(() =>
  import('../TagsAndEntities/TagChip').then(m => ({ default: m.TagChip })),
);

const slugger = new GithubSlugger();

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const headingVariants: Record<
  HeadingTag,
  'title-large' | 'title-medium' | 'title-small' | 'title-x-small'
> = {
  h1: 'title-large',
  h2: 'title-large',
  h3: 'title-medium',
  h4: 'title-medium',
  h5: 'title-small',
  h6: 'title-x-small',
};

const flatten = (text: string, child: any): string => {
  if (!child) return text;

  return typeof child === 'string'
    ? text + child
    : Children.toArray(child.props.children).reduce(flatten, text);
};

export const MarkdownRenderer = (props: {
  content: string;
  className?: string;
  showToc?: boolean;
  useBlankLinks?: boolean;
}) => {
  const { content, className: mainClassName, showToc, useBlankLinks } = props;
  const darkTheme = useIsDarkTheme();
  const { t } = useTranslationRef(qetaTranslationRef);
  const toastApi = useApi(toastApiRef);
  slugger.reset();

  const copyToClipboard = (slug: string) => {
    const url = new URL(window.location.href);
    url.hash = `#${slug}`;
    window.navigator.clipboard.writeText(url.toString());
    toastApi.post({
      title: t('link.copied'),
      status: 'info',
    });
  };

  const copyCodeToClipboard = (code: string) => {
    window.navigator.clipboard.writeText(code);
    toastApi.post({
      title: t('code.copied'),
      status: 'info',
    });
  };

  const headingRenderer = (
    hProps: PropsWithChildren<{ node: { tagName: string } }>,
  ) => {
    const { node, children } = hProps;
    const childrenArray = Children.toArray(children);
    const text = childrenArray.reduce(flatten, '');
    const slug = slugger.slug(text);
    const tag = node.tagName as HeadingTag;
    const link = (
      <TooltipTrigger>
        <ButtonIcon
          aria-label={t('link.aria')}
          onPress={() => copyToClipboard(slug)}
          size="small"
          variant="tertiary"
          className="anchor-link"
          icon={<RiLinksLine size={16} />}
        />
        <Tooltip>{t('link.aria')}</Tooltip>
      </TooltipTrigger>
    );
    return (
      <Text
        as={tag}
        variant={headingVariants[tag]}
        id={slug}
        className={styles.header}
      >
        {children}
        {link}
      </Text>
    );
  };

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }

    const id = window.location.hash.slice(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  const extensions = useQetaContext();

  const rehypePlugins: import('unified').PluggableList = [[rehypeSlug]];
  if (showToc) {
    rehypePlugins.push([
      rehypeToc,
      {
        cssClasses: {
          toc: styles.toc,
          list: styles.tocList,
          listItem: styles.tocListItem,
          link: styles.tocLink,
        },
        customizeTOC: (toc: HtmlElementNode) => {
          const listItems = find(toc, { tagName: 'li' });
          if (!toc.children || !listItems) {
            return false;
          }
          const tocHeader: TextNode = {
            type: 'text',
            value: t('markdown.toc'),
          };
          const heading: HeadingNode = {
            type: 'element',
            tagName: 'h3',
            properties: {},
            children: [tocHeader],
          };

          toc.children.unshift(heading);
          return toc;
        },
      },
    ]);
  }

  return (
    <div className={`${styles.markdown} ${mainClassName ?? ''}`.trim()}>
      <MarkdownHooks
        remarkPlugins={[gfm, ...(extensions.remarkPlugins ?? [])]}
        rehypePlugins={[...rehypePlugins, ...(extensions.rehypePlugins ?? [])]}
        components={{
          h1: (p: any) => headingRenderer(p),
          h2: (p: any) => headingRenderer(p),
          h3: (p: any) => headingRenderer(p),
          h4: (p: any) => headingRenderer(p),
          h5: (p: any) => headingRenderer(p),
          h6: (p: any) => headingRenderer(p),
          p: (p: any) => {
            const { children } = p;
            const arr = Children.toArray(children);
            const formatted = arr.map((child: any) => {
              if (typeof child !== 'string') {
                return child;
              }
              const userMentions = findEntityMentions(child);
              const tagMentions = findTagMentions(child);
              if (userMentions.length === 0 && tagMentions.length === 0) {
                return child;
              }

              return child.split(' ').map((word: string) => {
                const userMention = userMentions.find(m => word === m);
                if (userMention) {
                  return (
                    <>
                      <EntityRefLink
                        entityRef={userMention.slice(1)}
                        hideIcon
                        target={useBlankLinks ? '_blank' : undefined}
                      />{' '}
                    </>
                  );
                }

                const tagMention = tagMentions.find(m => word === m);
                if (tagMention) {
                  return (
                    <TagChip
                      tag={tagMention.slice(1)}
                      style={{ marginBottom: 0 }}
                      useHref={useBlankLinks}
                      key={tagMention}
                    />
                  );
                }

                return <>{word} </>;
              });
            });

            return <p>{formatted}</p>;
          },
          code(p: any) {
            const { children, className, node, ...rest } = p;
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            return match ? (
              <div className={styles.codeBlockContainer}>
                <SyntaxHighlighter
                  {...rest}
                  PreTag="div"
                  language={match[1]}
                  style={darkTheme ? a11yDark : a11yLight}
                  showLineNumbers
                >
                  {codeString}
                </SyntaxHighlighter>
                <TooltipTrigger>
                  <ButtonIcon
                    aria-label={t('code.aria')}
                    size="small"
                    variant="tertiary"
                    className="copyCodeButton"
                    icon={<RiFileCopyLine size={16} />}
                    onPress={() => copyCodeToClipboard(codeString)}
                  />
                  <Tooltip>{t('code.aria')}</Tooltip>
                </TooltipTrigger>
              </div>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </MarkdownHooks>
    </div>
  );
};
