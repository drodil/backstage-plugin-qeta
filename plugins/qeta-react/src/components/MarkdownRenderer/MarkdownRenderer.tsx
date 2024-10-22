import React, { PropsWithChildren } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useIsDarkTheme } from '../../utils/hooks';
import { makeStyles } from '@material-ui/core';
import { findUserMentions } from '@drodil/backstage-plugin-qeta-common';
import gfm from 'remark-gfm';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

export type QetaMarkdownContentClassKey = 'markdown';

const useStyles = makeStyles(
  theme => ({
    markdown: {
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
    },
  }),
  { name: 'QetaMarkdownContent' },
);

const flatten = (text: string, child: any): string => {
  if (!child) return text;

  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
};

const headingRenderer = (
  props: PropsWithChildren<{ node: { tagName: string } }>,
) => {
  const { node, children } = props;
  const childrenArray = React.Children.toArray(children);
  const text = childrenArray.reduce(flatten, '');
  const slug = text.toLocaleLowerCase('en-US').replace(/\W/g, '-');
  return React.createElement(`${node.tagName}`, { id: slug }, children);
};

export const MarkdownRenderer = (props: {
  content: string;
  className?: string;
}) => {
  const { content, className: mainClassName } = props;
  const darkTheme = useIsDarkTheme();
  const classes = useStyles();
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
          const { children, ...rest } = p;
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
                    <EntityRefLink entityRef={mention.slice(1)} />{' '}
                  </>
                );
              }
              return <>{word} </>;
            });
          });

          return <p {...rest}>{formatted}</p>;
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
