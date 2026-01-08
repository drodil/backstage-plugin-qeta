import {
  CommonFilterPanelProps,
  PostFilters,
} from '../FilterPanel/FilterPanel';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import { EntityFollowButton } from '../Buttons/EntityFollowButton';
import { CreateLinkButton, WriteArticleButton } from '../Buttons';
import { ViewType } from '../ViewToggle/ViewToggle';
import { capitalize } from 'lodash';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Box, Grid, Typography } from '@material-ui/core';
import { QetaEntityContainer } from '../QetaEntityContainer/QetaEntityContainer';
import { PostsGridItem } from './PostsGridItem';
import { PostListItem } from './PostListItem';
import { PostResponse, PostType } from '@drodil/backstage-plugin-qeta-common';
import { getFiltersWithDateRange } from '../../utils';
import { NoPostsCard } from './NoPostsCard';

export type PostsContainerProps = {
  type?: PostType;
  tags?: string[];
  author?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
  favorite?: boolean;
  showAskButton?: boolean;
  showWriteButton?: boolean;
  showLinkButton?: boolean;
  showNoQuestionsBtn?: boolean;
  collectionId?: number;
  initialPageSize?: number;
  entity?: string;
  filterPanelProps?: CommonFilterPanelProps;
  showTypeLabel?: boolean;
  allowRanking?: boolean;
  defaultView?: ViewType;
  view?: ViewType;
  onViewChange?: (view: ViewType) => void;
  status?: string;
  prefix?: string;
  orderBy?:
    | 'rank'
    | 'created'
    | 'title'
    | 'views'
    | 'score'
    | 'trend'
    | 'answersCount'
    | 'updated';
};

export const PostsContainer = (props: PostsContainerProps) => {
  const {
    type,
    tags,
    author,
    entity,
    showFilters,
    showTitle,
    title,
    favorite,
    showAskButton,
    showWriteButton,
    showLinkButton,
    showNoQuestionsBtn,
    showTypeLabel,
    allowRanking,
    defaultView,
    collectionId,
    initialPageSize,
    orderBy,
    prefix,
  } = props;

  const { t } = useTranslationRef(qetaTranslationRef);

  const itemType = capitalize(t(`common.${type ?? 'post'}` as any, {}));
  let shownTitle: React.ReactNode = title;
  let link = undefined;
  let btn = undefined;

  if (author) {
    shownTitle = t(`postsContainer.title.by`, { itemType });
    link = <EntityRefLink entityRef={author} hideIcon defaultKind="user" />;
  } else if (entity) {
    shownTitle = t(`postsContainer.title.about`, { itemType });
    link = <EntityRefLink entityRef={entity} />;
    btn = <EntityFollowButton entityRef={entity} />;
  } else if (tags) {
    shownTitle = `#${tags.join(', #')}`;
    if (tags.length === 1) {
      btn = <TagFollowButton tag={tags[0]} />;
    }
  } else if (favorite) {
    shownTitle = t('postsContainer.title.favorite', {
      itemType: itemType.toLowerCase(),
    });
  }

  const headerElement = (showTitle ||
    showAskButton ||
    showWriteButton ||
    showLinkButton) && (
    <Box mb={3}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          {showTitle && (
            <Typography
              variant="h5"
              className="qetaPostsContainerTitle"
              style={{ fontWeight: 500, paddingBottom: 2 }}
            >
              {shownTitle} {link} {btn}
            </Typography>
          )}
        </Grid>
        <Grid item>
          {showAskButton && (
            <AskQuestionButton
              entity={entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          )}
          {showWriteButton && (
            <WriteArticleButton
              entity={entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          )}
          {showLinkButton && (
            <CreateLinkButton
              entity={entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box className="qetaPostsContainer">
      {headerElement}
      <QetaEntityContainer<PostResponse, PostFilters>
        prefix={prefix ?? `posts${type ? `-${type}` : ''}`}
        defaultPageSize={initialPageSize}
        initialFilters={{
          order: 'desc',
          searchQuery: '',
          orderBy: orderBy ?? 'created',
          type: type,
          tags: tags,
          entity: entity,
          author: author,
          noAnswers: 'false',
          noVotes: 'false',
          noCorrectAnswer: 'false',
          status: props.status as any,
          collectionId: collectionId,
        }}
        filterPanelProps={
          showFilters ?? true
            ? {
                mode: 'posts',
                type: type as PostType,
                showEntityFilter: entity === undefined,
                ...props.filterPanelProps,
              }
            : undefined
        }
        fetchDeps={[type, tags, author, entity, favorite, collectionId]}
        fetch={(api, limit, offset, filters) => {
          const { entity: _entity, ...otherFilters } = filters;
          return api
            .getPosts({
              limit,
              offset,
              ...(getFiltersWithDateRange(otherFilters) as any),
              type: type,
              tags: tags ?? filters.tags,
              entities: entity ? [entity] : filters.entities,
              author: author ?? filters.author,
              favorite: favorite,
              collectionId: collectionId,
            })
            .then(res => ({ items: res.posts, total: res.total }));
        }}
        renderGridItem={(post, { retry }) => (
          <PostsGridItem
            post={post}
            entity={entity}
            type={type as PostType}
            allowRanking={allowRanking}
            onRankUpdate={retry}
            collectionId={collectionId}
          />
        )}
        renderListItem={(post, { retry }) => (
          <PostListItem
            post={post}
            entity={entity}
            type={type as PostType}
            showTypeLabel={showTypeLabel}
            allowRanking={allowRanking}
            onRankUpdate={retry}
            collectionId={collectionId}
          />
        )}
        title={total => (
          <Typography
            variant="h6"
            className="qetaPostsContainerQuestionCount"
            style={{ fontWeight: 500, paddingBottom: 2 }}
          >
            {t('common.posts', { count: total, itemType })}
          </Typography>
        )}
        searchPlaceholder={t('postsContainer.search.label', {
          itemType: itemType.toLowerCase(),
        })}
        emptyMessage={t('common.posts', { count: 0, itemType })}
        getKey={post => post.id}
        defaultView={defaultView} // Pass the view prop as defaultView
        emptyState={
          <NoPostsCard
            showNoPostsBtn={showNoQuestionsBtn}
            entity={entity}
            entityPage={entity !== undefined}
            tags={tags}
            type={type}
          />
        }
      />
    </Box>
  );
};
