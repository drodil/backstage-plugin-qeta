import { TimelineItem } from '@drodil/backstage-plugin-qeta-common';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Link,
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

import { useUserInfo } from '../../hooks';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    padding: 0,
    marginBottom: '2px',
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

  if (item.type === 'post') {
    if (item.postType === 'article') {
      link = articleRoute({ id: item.postId.toString() });
    } else if (item.postType === 'link') {
      link = linkRoute({ id: item.postId.toString() });
    } else {
      link = questionRoute({ id: item.postId.toString() });
    }
  } else if (item.type === 'answer') {
    link = `${questionRoute({ id: item.postId.toString() })}#answer_${item.id}`;
    title = `${item.postTitle}`;
  } else if (item.type === 'comment') {
    if (item.postType === 'article') {
      link = articleRoute({ id: item.postId.toString() });
    } else if (item.postType === 'link') {
      link = linkRoute({ id: item.postId.toString() });
    } else {
      link = questionRoute({ id: item.postId.toString() });
    }
    title = `${item.postTitle}`;
  } else if (item.type === 'collection') {
    link = collectionRoute({ id: item.id.toString() });
  }

  let action: string = t('timeline.created');
  if (item.action === 'updated') {
    action = t('timeline.updated');
  }

  if (item.type === 'answer') {
    action = t('timeline.answered');
  } else if (item.type === 'comment') {
    action = t('timeline.commentOn');
  }

  return (
    <ListItem alignItems="center" className={classes.root} dense>
      <ListItemAvatar className={classes.avatar}>
        <Avatar
          alt={item.author}
          src={item.headerImage || user?.spec?.profile?.picture}
          style={{ width: '26px', height: '26px', fontSize: '14px' }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <div className={classes.text}>
            <UserLink entityRef={item.author} />
            <span className={classes.action}>{action}</span>
            <Link component={RouterLink} to={link} className={classes.link}>
              {title}
            </Link>
            <span className={classes.time}>
              <RelativeTimeWithTooltip value={item.date} />
            </span>
          </div>
        }
      />
    </ListItem>
  );
};
