import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import { Text } from '@backstage/ui';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import {
  QetaCollectionDocument,
  QetaPostDocument,
  QetaSearchDocument,
  removeMarkdownFormatting,
  selectByPostType,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import DOMPurify from 'dompurify';
import { capitalize } from 'lodash';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';
import { parseEntityRef } from '@backstage/catalog-model';
import {
  RiBookOpenLine,
  RiLink,
  RiPlayList2Line,
  RiQuestionLine,
} from '@remixicon/react';
import styles from './QetaSearchResultListItem.module.css';

export type QetaSearchResultListItemProps = {
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
  hideIcon?: boolean;
};

const isQetaSearchDocument = (
  document: IndexableDocument,
): document is QetaSearchDocument => {
  return (
    'docType' in document &&
    (document.docType === 'qeta_post' || document.docType === 'qeta_collection')
  );
};

const isQetaPostDocument = (
  document: QetaSearchDocument,
): document is QetaPostDocument => {
  return document.docType === 'qeta_post';
};

const isQetaCollectionDocument = (
  document: QetaSearchDocument,
): document is QetaCollectionDocument => {
  return document.docType === 'qeta_collection';
};

const Excerpt = (props: {
  document: QetaSearchDocument;
  highlight?: ResultHighlight;
}) => {
  const { document, highlight } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  const text = DOMPurify.sanitize(
    truncate(
      removeMarkdownFormatting(highlight?.fields.text ?? document.text),
      300,
    ),
  );

  if (isQetaPostDocument(document)) {
    const authorEntity = parseEntityRef(document.author, {
      defaultKind: 'user',
      defaultNamespace: 'default',
    });
    return (
      <>
        <Text
          className={styles.excerptMeta}
          variant="body-small"
          color="secondary"
        >
          {capitalize(t(`common.${document.postType}`))}
          {' · '}
          {t('searchResult.created')}{' '}
          {DateTime.fromISO(document.created.toString() as string).toRelative()}
          {' · '}
          <EntityRefLink entityRef={authorEntity} hideIcon />
          {document.postType !== 'link' && (
            <>
              {' · '}
              {t('common.score', { score: document.score.toString(10) })}
            </>
          )}
          {' · '}
          {document.postType === 'link' &&
            t('common.clicksCount', { count: document.views })}
          {document.postType !== 'link' &&
            t('common.viewsShort', { count: document.views })}
          {document.postType !== 'link' && (
            <>
              {' · '}
              {t('common.answersCount', { count: document.answerCount })}
            </>
          )}
        </Text>
        <>
          {highlight?.fields.text ? (
            <HighlightedSearchResultText
              text={text}
              preTag={highlight.preTag}
              postTag={highlight.postTag}
            />
          ) : (
            text
          )}
        </>
      </>
    );
  } else if (isQetaCollectionDocument(document)) {
    const ownerEntity = parseEntityRef(document.owner, {
      defaultKind: 'user',
      defaultNamespace: 'default',
    });
    return (
      <>
        <Text
          className={styles.excerptMeta}
          variant="body-small"
          color="secondary"
        >
          {capitalize(t(`common.collection`))}
          {' · '}
          {t('searchResult.created')}{' '}
          {DateTime.fromISO(document.created.toString() as string).toRelative()}
          {' · '}
          <EntityRefLink entityRef={ownerEntity} hideIcon />
          {' · '}
          {t('common.posts', {
            count: document.postsCount,
            itemType: t('common.post'),
          })}
        </Text>
        <>
          {highlight?.fields.text ? (
            <HighlightedSearchResultText
              text={text}
              preTag={highlight.preTag}
              postTag={highlight.postTag}
            />
          ) : (
            text
          )}
        </>
      </>
    );
  }

  return null;
};

const ResultIcon = (props: { document: QetaSearchDocument }) => {
  const { document } = props;
  if (isQetaPostDocument(document)) {
    return selectByPostType(
      document.postType,
      <RiQuestionLine size={20} />,
      <RiBookOpenLine size={20} />,
      <RiLink size={20} />,
    );
  }

  return <RiPlayList2Line size={20} />;
};

export const QetaSearchResultListItem = (
  props: QetaSearchResultListItemProps,
) => {
  const { result, highlight, hideIcon } = props;

  if (!result || !isQetaSearchDocument(result)) {
    return null;
  }

  const title = (
    <Link noTrack to={result.location}>
      {highlight?.fields.title ? (
        <HighlightedSearchResultText
          text={highlight.fields.title}
          preTag={highlight.preTag}
          postTag={highlight.postTag}
        />
      ) : (
        result.title
      )}
    </Link>
  );

  return (
    <>
      <article
        className={styles.resultItem}
        aria-labelledby={`search-result-${result.title}`}
      >
        {hideIcon !== true && (
          <span className={styles.resultIcon}>
            <ResultIcon document={result} aria-hidden="true" />
          </span>
        )}
        <div className={styles.itemText}>
          <h3 id={`search-result-${result.title}`} className={styles.title}>
            {title}
          </h3>
          <div className={styles.excerpt}>
            <Excerpt document={result} highlight={highlight} />
          </div>
        </div>
      </article>

      <hr className={styles.divider} aria-hidden="true" />
    </>
  );
};
