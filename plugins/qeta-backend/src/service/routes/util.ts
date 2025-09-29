import {
  Answer,
  Post,
  QetaIdEntity,
  QetaSignal,
} from '@drodil/backstage-plugin-qeta-common';
import { SignalsService } from '@backstage/plugin-signals-node';
import { lookup } from 'mime-types';
import sanitizeHtml from 'sanitize-html';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { LoggerService } from '@backstage/backend-plugin-api';

export const wrapAsync = async (fn: Function) => {
  fn();
};

export const signalPostStats = (
  signalService?: SignalsService,
  question?: Post | null,
) => {
  if (!signalService || !question) {
    return;
  }
  signalService.publish<QetaSignal>({
    recipients: { type: 'broadcast' },
    channel: `qeta:post_${question.id}`,
    message: {
      type: 'post_stats',
      views: question.views,
      score: question.score,
      answersCount: question.answersCount,
      correctAnswer: question.correctAnswer,
    },
  });
};

export const signalAnswerStats = (
  signalService?: SignalsService,
  answer?: Answer | null,
) => {
  if (!signalService || !answer) {
    return;
  }
  signalService.publish<QetaSignal>({
    recipients: { type: 'broadcast' },
    channel: `qeta:answer_${answer.id}`,
    message: {
      type: 'answer_stats',
      score: answer.score,
      correctAnswer: answer.correct,
    },
  });
};

export const validateDateRange = (
  fromDate: string,
  toDate: string,
): { isValid: boolean; error?: string; field?: string } => {
  if (fromDate && toDate) {
    const fromDateNewDate = new Date(fromDate);
    const toDateNewDate = new Date(toDate);
    if (fromDateNewDate <= toDateNewDate) {
      return { isValid: true };
    }
    return { isValid: false, error: 'From Date should be less than To Date' };
  } else if (!fromDate && toDate) {
    return {
      isValid: false,
      field: 'fromDate',
      error: 'Please enter from date in format YYYY-MM-DD',
    };
  } else if (fromDate && !toDate) {
    return {
      isValid: false,
      field: 'toDate',
      error: 'Please enter to date in format YYYY-MM-DD',
    };
  }

  return { isValid: true };
};

export const entityToJsonObject = (entity: QetaIdEntity) => {
  try {
    return JSON.parse(JSON.stringify(entity));
  } catch {
    return { id: entity.id };
  }
};

const imageURLToDataURL = async (
  imageURL: string,
  response: Response,
): Promise<string> => {
  const buffer = await response.arrayBuffer();
  const contentType =
    response.headers.get('content-type') ||
    lookup(imageURL) ||
    'application/octet-stream';

  const encoded = btoa(
    Array.from(new Uint8Array(buffer))
      .map(b => String.fromCharCode(b))
      .join(''),
  );
  return `data:${contentType};base64,${encoded}`;
};

const unrelativeURL = (path: string, url: URL): string => {
  const isRelativePath = !path.startsWith('http');
  if (isRelativePath) {
    return `${url.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
};

const extractFavicon = async (
  $: CheerioAPI,
  url: URL,
  logger: LoggerService,
): Promise<string | undefined> => {
  const favicon =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    $('link[rel="apple-touch-icon"]').attr('href') ||
    $('link[rel="apple-touch-icon-precomposed"]').attr('href') ||
    $('link[rel="mask-icon"]').attr('href');

  const faviconURLs = [
    `${url.origin}/favicon.ico`, // most common location
    favicon ? unrelativeURL(favicon, url) : undefined,
    `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=16`, // google service as fallback
  ];

  for (const faviconURL of faviconURLs) {
    if (!faviconURL) continue;

    try {
      const response = await fetch(faviconURL, {
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        return await imageURLToDataURL(faviconURL, response);
      }
    } catch (e) {
      logger.warn(`Failed to fetch favicon from url ${faviconURL}`, e);
    }
  }

  return undefined;
};

// Helper to log detailed extractMetadata errors in a single place
const logExtractMetadataError = (
  logger: LoggerService,
  url: URL,
  e: unknown,
): void => {
  const err = e as any;
  const name = err?.name ? `${err.name}: ` : '';
  const message = err?.message ?? String(err);
  const detail = err?.status ? ` (status: ${err.status})` : '';
  const formatCause = (c: any): string => {
    if (!c) return '';
    const cn = c?.name ? `${c.name}: ` : '';
    const cm = c?.message ?? String(c);
    const cs = c?.status ? ` (status: ${c.status})` : '';
    const nested =
      c?.cause && c.cause !== c ? `; cause: ${formatCause(c.cause)}` : '';
    return `${cn}${cm}${cs}${nested}`;
  };
  const causeInfo = err?.cause ? `; cause: ${formatCause(err.cause)}` : '';
  logger.warn(
    `${name}Failed to extract metadata from ${url.toString()}: ${message}${detail}${causeInfo}`,
  );
};

export const extractMetadata = async (
  url: URL,
  logger: LoggerService,
): Promise<{
  title?: string;
  content?: string;
  image?: string;
  favicon?: string;
}> => {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch metadata from ${url.toString()}: ${response.status} ${
          response.statusText
        }`,
      );
    }

    const html = await response.text().then(dirty =>
      sanitizeHtml(dirty, {
        allowedTags: ['title', 'meta', 'link'],
        allowedAttributes: {
          meta: ['name', 'content', 'property'],
          link: ['rel', 'href'],
        },
      }),
    );

    const $ = cheerio.load(html);
    const title =
      $('meta[property="og:title"]').attr('content') || $('title').text();
    const content =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content');
    const image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');
    const favicon = await extractFavicon($, url, logger);

    return {
      title,
      content,
      image,
      favicon,
    };
  } catch (e) {
    logExtractMetadataError(logger, url, e);
    return {};
  }
};
