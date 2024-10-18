import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useIsDarkTheme } from '../../utils/hooks';

export const MarkdownRenderer = (props: {
  content: string;
  className?: string;
}) => {
  const { content, className: mainClassName } = props;
  const darkTheme = useIsDarkTheme();
  return (
    <ReactMarkdown
      className={mainClassName}
      components={{
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
