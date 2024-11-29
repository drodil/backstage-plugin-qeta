import React, { PropsWithChildren, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IconButton, makeStyles, Tooltip } from '@material-ui/core';
import { findUserMentions } from '@drodil/backstage-plugin-qeta-common';
import gfm from 'remark-gfm';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useIsDarkTheme } from '../../hooks/useIsDarkTheme';
import { BackstageOverrides } from '@backstage/core-components';
import LinkIcon from '@material-ui/icons/Link';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { useTranslation } from '../../hooks';

export type QetaMarkdownContentClassKey = 'markdown';

const useStyles = makeStyles(
  theme => {
    const overrides = theme.overrides as BackstageOverrides;
    return {
      markdown: {
        '& p': {
          ...theme.typography?.body1,
        },
        '& h1': {
          ...theme.typography?.h1,
          marginBottom: 2,
        },
        '& h2': {
          ...theme.typography?.h2,
          marginBottom: 2,
        },
        '& h3': {
          ...theme.typography?.h3,
          marginBottom: 2,
        },
        '& h4': {
          ...theme.typography?.h4,
          marginBottom: 2,
        },
        '& h5': {
          ...theme.typography?.h5,
          marginBottom: 2,
        },
        '& h6': {
          ...theme.typography?.h6,
          marginBottom: 2,
        },
        '& table': {
          borderCollapse: 'collapse',
          border: `1px solid ${theme.palette.border}`,
        },
        '& th, & td': {
          border: `1px solid ${theme.palette.border}`,
          padding: theme.spacing(1),
        },
        '& td': {
          wordBreak: 'break-word',
          overflow: 'hidden',
          verticalAlign: 'middle',
          lineHeight: '1',
          margin: 0,
          padding: theme.spacing(3, 2, 3, 2.5),
          borderBottom: 0,
        },
        '& th': {
          backgroundColor: theme.palette.background.paper,
        },
        '& tr': {
          backgroundColor: theme.palette.background.paper,
        },
        '& tr:nth-child(odd)': {
          backgroundColor: theme.palette.background.default,
        },
        '& a': {
          color: theme.palette.link,
        },
        '& img': {
          maxWidth: '100%',
        },
        '& code': {
          fontFamily: 'Courier New,Courier,monospace',
          fontStyle: 'normal',
        },
        '& em': {
          fontStyle: 'italic !important',
        },
        '& ol': {
          listStyle: 'decimal',
        },
        '& ul': {
          listStyle: 'disc',
        },
        '& blockquote': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          padding: '1em',
        },
        '& ol, ul': {
          marginLeft: '1em',
          marginTop: '1em',
          marginBottom: '1em',
        },
        '& li': {
          marginTop: '0.5em',
        },
        '& *:first-child': {
          marginTop: 0,
        },
        '& *:last-child': {
          marginBottom: 0,
        },
        ...(overrides?.BackstageMarkdownContent
          ? overrides.BackstageMarkdownContent
          : {}),
      },
      header: {
        '& .anchor-link': {
          display: 'none',
          marginLeft: '0.5em',
        },
        '&:hover .anchor-link': {
          display: 'inline-block',
        },
      },
    };
  },
  { name: 'QetaMarkdownContent' },
);

const flatten = (text: string, child: any): string => {
  if (!child) return text;

  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
};

export const MarkdownRenderer = (props: {
  content: string;
  className?: string;
}) => {
  const { content, className: mainClassName } = props;
  const darkTheme = useIsDarkTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const alertApi = useApi(alertApiRef);

  const copyToClipboard = (slug: string) => {
    const url = new URL(window.location.href);
    url.hash = `#${slug}`;
    window.navigator.clipboard.writeText(url.toString());
    alertApi.post({
      message: t('link.copied'),
      severity: 'info',
      display: 'transient',
    });
  };

  const headingRenderer = (
    hProps: PropsWithChildren<{ node: { tagName: string } }>,
  ) => {
    const { node, children } = hProps;
    const childrenArray = React.Children.toArray(children);
    const text = childrenArray.reduce(flatten, '');
    const slug = text.toLocaleLowerCase('en-US').replace(/\W/g, '-');
    const link = (
      <Tooltip title={t('link.aria')}>
        <IconButton
          aria-label={t('link.aria')}
          onClick={() => copyToClipboard(slug)}
          size="small"
          className="anchor-link"
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
    );
    return (
      <>
        {React.createElement(
          `${node.tagName}`,
          { id: slug, className: classes.header },
          [children, link],
        )}
      </>
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

  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      className={`${classes.markdown} ${mainClassName ?? ''}`.trim()}
      components={{
        h1: (p: any) => headingRenderer(p),
        h2: (p: any) => headingRenderer(p),
        h3: (p: any) => headingRenderer(p),
        h4: (p: any) => headingRenderer(p),
        h5: (p: any) => headingRenderer(p),
        h6: (p: any) => headingRenderer(p),
        p: (p: any) => {
          const { children } = p;
          const arr = React.Children.toArray(children);
          const formatted = arr.map((child: any) => {
            if (typeof child !== 'string') {
              return child;
            }
            const mentions = findUserMentions(child);
            if (mentions.length === 0) {
              return child;
            }

            return child.split(' ').map((word: string) => {
              const mention = mentions.find(m => word.includes(m));
              if (mention) {
                return (
                  <>
                    <EntityRefLink entityRef={mention.slice(1)} hideIcon />{' '}
                  </>
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
          return match ? (
            <SyntaxHighlighter
              {...rest}
              PreTag="div"
              language={match[1]}
              style={darkTheme ? a11yDark : a11yLight}
              showLineNumbers
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
