import { Fragment, ReactNode } from 'react';
import {
  Post,
  PostsQuery,
  PostType,
  selectByPostType,
} from '@drodil/backstage-plugin-qeta-common';
import { useQetaApi, useQetaConfig } from '../../hooks';
import { Link } from 'react-router-dom';
import { RightList, RightListContainer } from '../Utility/RightList';
import { Box, List, ListRow, Skeleton } from '@backstage/ui';
import { qetaTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import numeral from 'numeral';
import { PostTooltip } from '../Tooltips';
import {
  RiHistoryLine,
  RiFireLine,
  RiBookmarkLine,
  RiUserLine,
  RiQuestionLine,
  RiErrorWarningLine,
} from '@remixicon/react';
import styles from './PostHighlightList.module.css';

const typeIconMap: Record<string, ReactNode> = {
  recent: <RiHistoryLine size={16} />,
  hot: <RiFireLine size={16} />,
  followed: <RiBookmarkLine size={16} />,
  own: <RiUserLine size={16} />,
  unanswered: <RiQuestionLine size={16} />,
  incorrect: <RiErrorWarningLine size={16} />,
};

function formatShortNumber(num: number): string {
  return num >= 1000 ? numeral(num).format('0.0 a') : num.toString();
}

export const PostHighlightListContent = (props: {
  loading?: boolean;
  error?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  posts: Post[];
  title: string;
  icon?: ReactNode;
  noPostsLabel?: string;
  disableLoading?: boolean;
  containerClassName?: string;
  titleClassName?: string;
  hideIfEmpty?: boolean;
}) => {
  const {
    loading,
    error,
    posts,
    title,
    icon,
    noPostsLabel,
    disableLoading,
    containerClassName,
    titleClassName,
    hideIfEmpty,
  } = props;

  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);

  // Hide the component if empty and hideIfEmpty is true
  if (hideIfEmpty && !loading && !error && posts.length === 0) {
    return null;
  }

  return (
    <RightListContainer className={containerClassName}>
      <RightList title={title} icon={icon} titleClassName={titleClassName}>
        {loading &&
          !disableLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <List key={`skeleton-${i}`}>
              <ListRow icon={<Skeleton rounded width={28} height={24} />}>
                <Skeleton width="80%" height={16} />
              </ListRow>
            </List>
          ))}
        {error && (
          <List>
            <ListRow>{t('highlights.loadError')}</ListRow>
          </List>
        )}
        {!error && !loading && posts.length === 0 && noPostsLabel && (
          <List>
            <ListRow>{noPostsLabel}</ListRow>
          </List>
        )}
        {!error &&
          posts.map(q => {
            const route = selectByPostType(
              q.type,
              questionRoute,
              articleRoute,
              linkRoute,
            );
            const href = route({ id: q.id.toString(10) });
            const vote = formatShortNumber(q.score);
            let voteBoxClass = styles.voteBox;
            if (q.correctAnswer) {
              voteBoxClass = `${styles.voteBox} ${styles.voteBoxPositive}`;
            } else if (q.score < 0) {
              voteBoxClass = `${styles.voteBox} ${styles.voteBoxNegative}`;
            }
            return (
              <Fragment key={q.id}>
                <PostTooltip
                  post={q}
                  arrow
                  enterDelay={400}
                  enterNextDelay={400}
                  placement="left"
                  interactive={false}
                >
                  <Link to={href} className={styles.link} aria-label={q.title}>
                    <List>
                      <ListRow
                        icon={<Box className={voteBoxClass}>{vote}</Box>}
                      >
                        {q.title}
                      </ListRow>
                    </List>
                  </Link>
                </PostTooltip>
              </Fragment>
            );
          })}
      </RightList>
    </RightListContainer>
  );
};
export const PostHighlightList = (props: {
  type: string;
  title: string;
  noQuestionsLabel: string;
  icon?: ReactNode;
  options?: PostsQuery;
  postType?: PostType;
  hideIfEmpty?: boolean;
}) => {
  const { isPostTypeDisabled } = useQetaConfig();

  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getPostsList(props.type, {
        limit: 5,
        type: props.postType,
        includeTags: false,
        includeAttachments: false,
        includeComments: false,
        includeAnswers: false,
        includeVotes: false,
        includeEntities: false,
        includeExperts: false,
        ...props.options,
      }),
    [],
  );

  if (props.postType && isPostTypeDisabled(props.postType)) {
    return null;
  }

  const posts = response?.posts ?? [];

  return (
    <PostHighlightListContent
      posts={posts}
      loading={loading}
      error={error}
      title={props.title}
      icon={props.icon ?? typeIconMap[props.type]}
      noPostsLabel={props.noQuestionsLabel}
      hideIfEmpty={props.hideIfEmpty}
    />
  );
};
