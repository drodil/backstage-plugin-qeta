import {
  Collection,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import {
  Box,
  ListItemAvatar,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DOMPurify from 'dompurify';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { CollectionFollowButton } from '../Buttons/CollectionFollowButton';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import LinkIcon from '@material-ui/icons/Link';
import DescriptionIcon from '@material-ui/icons/Description';
import { Link } from 'react-router-dom';

import { useListItemStyles } from '../../hooks';

const useStyles = makeStyles(theme => ({
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statsWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    marginLeft: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  actions: {
    marginLeft: theme.spacing(2),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
    color: theme.palette.text.secondary,
  },
  image: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
  },
}));

export const CollectionListItem = (props: { collection: Collection }) => {
  const { collection } = props;
  const classes = useStyles();
  const listItemClasses = useListItemStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  const collectionRoute = useRouteRef(collectionRouteRef);
  const href = collectionRoute({ id: collection.id.toString(10) });

  return (
    <Link to={href} className={listItemClasses.root}>
      <ListItemAvatar className={classes.avatar}>
        {collection.headerImage ? (
          <img
            src={collection.headerImage}
            alt={collection.title}
            className={classes.image}
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).innerHTML = '';
            }}
          />
        ) : (
          <PlaylistPlayIcon />
        )}
      </ListItemAvatar>
      <Box className={classes.content}>
        <Typography className={classes.title} noWrap>
          {collection.title}
        </Typography>
        {collection.description && (
          <Typography className={classes.description}>
            {DOMPurify.sanitize(
              truncate(removeMarkdownFormatting(collection.description), 100),
            )}
          </Typography>
        )}
      </Box>

      <Box className={classes.statsWrapper}>
        <Tooltip title={t('common.questions')} arrow>
          <div className={classes.statItem}>
            <QuestionAnswerIcon fontSize="small" />
            <Typography variant="body2">{collection.questionsCount}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.articles')} arrow>
          <div className={classes.statItem}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="body2">{collection.articlesCount}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.links')} arrow>
          <div className={classes.statItem}>
            <LinkIcon fontSize="small" />
            <Typography variant="body2">{collection.linksCount}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('common.followersPlain')} arrow>
          <div className={classes.statItem}>
            <PeopleIcon fontSize="small" />
            <Typography variant="body2">{collection.followers}</Typography>
          </div>
        </Tooltip>
      </Box>

      <Box
        className={classes.actions}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <CollectionFollowButton collection={collection} />
      </Box>
    </Link>
  );
};
