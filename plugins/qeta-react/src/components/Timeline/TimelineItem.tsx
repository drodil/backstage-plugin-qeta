import { TimelineItem } from '@drodil/backstage-plugin-qeta-common';
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
import { Avatar, Flex } from '@backstage/ui';

import { useUserInfo } from '../../hooks';
import styles from './TimelineItem.module.css';

export const TimelineItemCard = ({ item }: { item: TimelineItem }) => {
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
    <Flex align="center" gap="0" className={styles.root}>
      <RouterLink to={link} className={styles.overlayLink} aria-label={title} />
      <div className={`${styles.avatar} ${styles.contentWrapper}`}>
        <Avatar
          src={item.headerImage || user?.spec?.profile?.picture || ''}
          name={item.author}
          size="x-small"
        />
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.text}>
          <span className={styles.contentClickable}>
            <UserLink entityRef={item.author} />
          </span>
          <span className={styles.action}>{action}</span>
          {item.type === 'collection' ? (
            <CollectionTooltip
              collectionId={item.id}
              enterDelay={400}
              interactive={false}
            >
              <RouterLink
                to={link}
                className={`${styles.link} ${styles.contentClickable}`}
                id={item.id.toString()}
              >
                {title}
              </RouterLink>
            </CollectionTooltip>
          ) : (
            <PostTooltip
              id={(item.type === 'post' ? item.id : item.postId).toString()}
              enterDelay={400}
              interactive={false}
            >
              <RouterLink
                to={link}
                className={`${styles.link} ${styles.contentClickable}`}
              >
                {title}
              </RouterLink>
            </PostTooltip>
          )}
          <span className={styles.time}>
            <RelativeTimeWithTooltip value={item.date} />
          </span>
        </div>
      </div>
    </Flex>
  );
};
