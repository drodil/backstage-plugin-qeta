import { TimelineItem } from '@drodil/backstage-plugin-qeta-common';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  makeStyles,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';

import { useRouteRef } from '@backstage/core-plugin-api';
import {
  questionRouteRef,
  articleRouteRef,
  linkRouteRef,
  collectionRouteRef,
} from '../../routes';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { UserLink } from '../Links';
import { PostTooltip, CollectionTooltip } from '../Tooltips';

import { useUserInfo } from '../../hooks';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(1, 1.5),
    marginBottom: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 0.15s ease-in-out',
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  overlayLink: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  contentWrapper: {
    pointerEvents: 'none',
  },
  contentClickable: {
    position: 'relative',
    zIndex: 1,
    pointerEvents: 'auto',
  },
  inline: {
    display: 'inline',
  },
  avatar: {
    minWidth: '36px',
  },
  text: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  link: {
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '450px',
    display: 'inline-block',
    verticalAlign: 'bottom',
  },
  action: {
    opacity: 0.8,
  },
  time: {
    opacity: 0.6,
    fontSize: '0.8em',
    marginLeft: 'auto',
  },
}));

export const TimelineItemCard = ({ item }: { item: TimelineItem }) => {
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const collectionRoute = useRouteRef(collectionRouteRef);
  const { user } = useUserInfo(item.author);

  let title = item.title;
  let link: string = '';
  let action: string = '';

  if (item.type === 'post') {
    const postType = item.postType || 'question';
    const isUpdated = item.action === 'updated';
    if (postType === 'article') {
      link = articleRoute({ id: item.id.toString() });
      action = isUpdated
        ? t('timeline.updatedArticle')
        : t('timeline.postedArticle');
    } else if (postType === 'link') {
      link = linkRoute({ id: item.id.toString() });
      action = isUpdated ? t('timeline.updatedLink') : t('timeline.postedLink');
    } else {
      link = questionRoute({ id: item.id.toString() });
      action = isUpdated
        ? t('timeline.updatedQuestion')
        : t('timeline.postedQuestion');
    }
  } else if (item.type === 'answer') {
    link = `${questionRoute({ id: item.postId.toString() })}#answer_${item.id}`;
    title = item.postTitle;
    action = t('timeline.answered');
  } else if (item.type === 'comment') {
    title = item.postTitle;
    const postType = item.postType || 'question';
    if (postType === 'article') {
      link = articleRoute({ id: item.postId.toString() });
      action = t('timeline.commentedOnArticle');
    } else if (postType === 'link') {
      link = linkRoute({ id: item.postId.toString() });
      action = t('timeline.commentedOnLink');
    } else {
      link = questionRoute({ id: item.postId.toString() });
      action = t('timeline.commentedOnQuestion');
    }
  } else if (item.type === 'collection') {
    link = collectionRoute({ id: item.id.toString() });
    action = t('timeline.createdCollection');
  }

  return (
    <ListItem alignItems="center" className={classes.root} dense>
      <RouterLink
        to={link}
        className={classes.overlayLink}
        aria-label={title}
      />
      <ListItemAvatar className={`${classes.avatar} ${classes.contentWrapper}`}>
        <Avatar
          alt={item.author}
          src={item.headerImage || user?.spec?.profile?.picture}
          style={{ width: '26px', height: '26px', fontSize: '14px' }}
        />
      </ListItemAvatar>
      <ListItemText
        className={classes.contentWrapper}
        primary={
          <div className={classes.text}>
            <span className={classes.contentClickable}>
              <UserLink entityRef={item.author} />
            </span>
            <span className={classes.action}>{action}</span>
            {item.type === 'collection' ? (
              <CollectionTooltip
                collectionId={item.id}
                enterDelay={400}
                enterNextDelay={400}
                interactive={false}
              >
                <RouterLink
                  to={link}
                  className={`${classes.link} ${classes.contentClickable}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  id={item.id.toString()}
                >
                  {title}
                </RouterLink>
              </CollectionTooltip>
            ) : (
              <PostTooltip
                id={(item.type === 'post' ? item.id : item.postId).toString()}
                enterDelay={400}
                enterNextDelay={400}
                interactive={false}
              >
                <RouterLink
                  to={link}
                  className={`${classes.link} ${classes.contentClickable}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {title}
                </RouterLink>
              </PostTooltip>
            )}
            <span className={classes.time}>
              <RelativeTimeWithTooltip value={item.date} />
            </span>
          </div>
        }
      />
    </ListItem>
  );
};
