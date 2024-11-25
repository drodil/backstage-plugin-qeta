import React, { PropsWithChildren } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { findUserMentions } from '@drodil/backstage-plugin-qeta-common';
import gfm from 'remark-gfm';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useIsDarkTheme } from '../../hooks/useIsDarkTheme';
import {
  styled,
  StyleFunction,
  SxProps,
  unstable_styleFunctionSx,
} from '@mui/system';
import { Theme, useTheme } from '@mui/material/styles';

interface StyledReactMarkdownProps {
  sx?: SxProps;
}

const StyledReactMarkdown = styled(ReactMarkdown, {
  name: 'QetaReactMarkdown',
})<StyledReactMarkdownProps>(
  unstable_styleFunctionSx as StyleFunction<StyledReactMarkdownProps>,
);

const styles = (theme: any) => ({
  '& table': {
    borderCollapse: 'collapse',
    border: `1px solid ${theme.palette.border}`,
  },
  '& p': {
    ...theme.typography?.body1,
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.border}`,
    padding: '1em',
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
  '& blockquote': {
    backgroundColor: theme.palette.background.paper,
    border: `.1em solid ${theme.palette.divider}`,
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
  '& td': {
    wordBreak: 'break-word',
    overflow: 'hidden',
    verticalAlign: 'middle',
    lineHeight: '1',
    margin: 0,
    padding: '1em',
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
  '& em': {
    fontStyle: 'italic !important',
  },
  '& ol': {
    listStyle: 'decimal',
  },
  '& ul': {
    listStyle: 'disc',
  },
  '& a': {
    color: theme.palette.link,
  },
  '& code': {
    fontFamily: 'Courier New,Courier,monospace',
    fontStyle: 'normal',
  },
  '& img': {
    maxWidth: '100%',
  },
  '& *:first-child': {
    marginTop: 0,
  },
  '& *:last-child': {
    marginBottom: 0,
  },
});

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
  sx?: SxProps<Theme>;
}) => {
  const { content } = props;
  const darkTheme = useIsDarkTheme();
  const theme = useTheme();
  const allStyles: SxProps = {
    ...styles(theme),
    ...(props.sx ?? {}),
  } as SxProps;

  return (
    <StyledReactMarkdown
      remarkPlugins={[gfm]}
      sx={allStyles}
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
    </StyledReactMarkdown>
  );
};
