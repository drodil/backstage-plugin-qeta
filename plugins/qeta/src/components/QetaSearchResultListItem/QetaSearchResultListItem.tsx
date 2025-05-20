import { DateTime } from 'luxon';
import { Link } from '@backstage/core-components';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import {
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import {
  QetaCollectionDocument,
  QetaPostDocument,
  QetaSearchDocument,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import HelpOutlined from '@material-ui/icons/HelpOutlined';
import PlaylistPlay from '@material-ui/icons/PlaylistPlay';
import DOMPurify from 'dompurify';
import { capitalize } from 'lodash';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '@drodil/backstage-plugin-qeta-react';

const useStyles = makeStyles({
  excerptText: {
    display: 'block',
    marginTop: '0.2rem',
    marginBottom: '0.4rem',
    fontSize: '0.8rem',
  },
  excerpt: {
    lineHeight: '1.55',
  },
  itemText: {
    wordBreak: 'break-all',
  },
});

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
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const text = DOMPurify.sanitize(
    truncate(
      removeMarkdownFormatting(highlight?.fields.text ?? document.text),
      300,
    ),
  );
  if (isQetaPostDocument(document)) {
    return (
      <>
        <span className={classes.excerptText}>
          {capitalize(t(`common.${document.postType}`))}
          {' · '}
          {t('searchResult.created')}{' '}
          {DateTime.fromISO(document.created.toString() as string).toRelative()}
          {' · '}
          <EntityRefLink entityRef={document.author} hideIcon />
          {' · '}
          {t('common.score', { score: document.score.toString(10) })}
          {' · '}
          {t('common.viewsShort', { count: document.views })}
          {' · '}
          {t('common.answers', { count: document.answerCount })}
        </span>
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
    return (
      <>
        <span className={classes.excerptText}>
          {capitalize(t(`common.collection`))}
          {' · '}
          {t('searchResult.created')}{' '}
          {DateTime.fromISO(document.created.toString() as string).toRelative()}
          {' · '}
          <EntityRefLink entityRef={document.owner} hideIcon />
          {' · '}
          {t('common.posts', {
            count: document.postsCount,
            itemType: t('common.post'),
          })}
        </span>
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
    if (document.postType === 'article') {
      return <CollectionsBookmarkIcon />;
    }
    return <HelpOutlined />;
  }

  return <PlaylistPlay />;
};

export const QetaSearchResultListItem = (
  props: QetaSearchResultListItemProps,
) => {
  const classes = useStyles();
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
      <ListItem alignItems="center">
        {hideIcon !== true && (
          <ListItemIcon>
            <ResultIcon document={result} />
          </ListItemIcon>
        )}
        <ListItemText
          primary={title}
          secondary={<Excerpt document={result} highlight={highlight} />}
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
        />
      </ListItem>

      <Divider component="li" />
    </>
  );
};
