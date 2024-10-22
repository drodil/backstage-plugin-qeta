import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { compact } from 'lodash';

export const truncate = (str: string, n: number): string => {
  return str.length > n ? `${str.slice(0, n - 1)}...` : str;
};

export const findUserMentions = (text: string): string[] => {
  const mentions = text.match(/@(\S+)/g);
  const ret = mentions ? Array.from(new Set(mentions)) : [];
  return compact(
    ret.map(mention => {
      try {
        const parsed = parseEntityRef(mention.replace(/^@+/, ''));
        if (parsed.kind.toLocaleLowerCase('en-US') !== 'user') {
          return undefined;
        }
        return `@${stringifyEntityRef(parsed)}`;
      } catch (e) {
        return undefined;
      }
    }),
  );
};

// Covers many common but not all cases of markdown formatting
export const removeMarkdownFormatting = (text: string): string => {
  // Remove HTML tags
  let fixed = text.replace(/<[^>]*>/g, '');

  // Handle code blocks defined with a language
  fixed = fixed.replace(/```[\s\S]*?```/g, match => {
    return match.replace(/(^```[a-z]*\n)|(```$)/g, '').trim();
  });

  // Handle inline code blocks and code blocks defined using ```
  fixed = fixed.replace(/`{1,2}([^`]*)`{1,2}/g, '$1');

  // Remove other markdown formatting
  fixed = fixed
    .replace(/(?:\*\*|__)([^\n*]+)(?:\*\*|__)/g, '$1') // Bold
    .replace(/(?:\*|_)([^\n*]+)(?:\*|_)/g, '$1') // Italic
    .replace(/(?:~~)([^~]+)(?:~~)/g, '$1') // Strikethrough
    .replace(/^[>\t]{0,3}>+\s?/gm, '') // Blockquotes
    .replace(/\[\^.+?\](: .*?$)?/g, '') // Footnotes
    .replace(/^([ \t]*)([*\-+]|\d+\.)\s+/gm, '') // Lists
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // Images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
    .replace(/^#{1,6}[ \t]+/gm, '') // Headers
    .replace(/^[=-]{2,}\s*$/g, '') // Setex style headers
    .replace(/(?:\r\n|\r|\n)/g, ' ') // Newlines
    .replace(/(^\s+|\s+$)/g, ''); // Trimming leading and trailing spaces

  // Remove remaining HTML tags
  fixed = fixed.replace(/<[^>]*>/g, '');

  return fixed;
};
