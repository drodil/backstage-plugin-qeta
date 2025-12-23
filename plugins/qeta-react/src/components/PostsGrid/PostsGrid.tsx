import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  AskQuestionButton,
  CreateLinkButton,
  EntityFollowButton,
  TagFollowButton,
  WriteArticleButton,
} from '../Buttons';
import { ViewToggle, ViewType } from '../ViewToggle/ViewToggle';
import FilterList from '@material-ui/icons/FilterList';
import {
  CommonFilterPanelProps,
  FilterPanel,
  PostFilters,
} from '../FilterPanel/FilterPanel';
import { PostsGridContent } from './PostsGridContent';
import { capitalize } from 'lodash';
import {
  PaginatedPostsProps,
  usePaginatedPosts,
} from '../../hooks/usePaginatedPosts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import { SearchBar } from '../SearchBar/SearchBar.tsx';

export type PostGridProps = PaginatedPostsProps & {
  allowRanking?: boolean;
  filterPanelProps?: CommonFilterPanelProps;
  view?: ViewType;
  onViewChange?: (view: ViewType) => void;
};

export const PostsGrid = (props: PostGridProps) => {
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
    allowRanking,
    view,
    onViewChange,
  } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    onSearchQueryChange,
    filters,
    response,
    loading,
    error,
    setShowFilterPanel,
    showFilterPanel,
    onFilterChange,
    posts,
    hasMore,
    loadNextPage,
    retry,
  } = usePaginatedPosts(props);
  const combinedResponse = response ? { ...response, posts } : response;

  const itemType = capitalize(t(`common.${type ?? 'post'}`, {}));
  let shownTitle = title;
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
    shownTitle = t('postsContainer.title.favorite', { itemType });
  }

  return (
    <Box className="qetaPostsGrid">
      {showTitle && (
        <Typography
          variant="h5"
          className="qetaPostsGridTitle"
          style={{ marginBottom: '1.5em' }}
        >
          {shownTitle} {link} {btn}
        </Typography>
      )}
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <SearchBar
            onSearch={onSearchQueryChange}
            label={t('postsContainer.search.label', {
              itemType: itemType.toLowerCase(),
            })}
            loading={loading}
          />
        </Grid>
        {showAskButton && (
          <Grid item>
            <AskQuestionButton
              entity={entity ?? filters.entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          </Grid>
        )}
        {showWriteButton && (
          <Grid item>
            <WriteArticleButton
              entity={entity ?? filters.entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          </Grid>
        )}
        {showLinkButton && (
          <Grid item>
            <CreateLinkButton
              entity={entity ?? filters.entity}
              entityPage={entity !== undefined}
              tags={tags}
            />
          </Grid>
        )}
      </Grid>
      {response && (
        <Box mt={2} mb={2}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              {(response?.total ?? 0) > 0 && (
                <Typography
                  variant="h6"
                  className="qetaPostsContainerQuestionCount"
                  style={{ fontWeight: 500, paddingBottom: 2 }}
                >
                  {t('common.posts', { count: response?.total ?? 0, itemType })}
                </Typography>
              )}
            </Grid>
            <Grid item>
              <Grid container spacing={1} alignItems="center">
                {view && onViewChange && (
                  <Grid item>
                    <ViewToggle view={view} onChange={onViewChange} />
                  </Grid>
                )}
                {(showFilters ?? true) && (
                  <Grid item>
                    <Button
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                      className="qetaPostsContainerFilterPanelBtn"
                      startIcon={<FilterList />}
                    >
                      {t('filterPanel.filterButton')}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<PostFilters>
            onChange={onFilterChange}
            filters={filters}
            type={type}
            {...props.filterPanelProps}
          />
        </Collapse>
      )}
      <PostsGridContent
        loading={loading}
        error={error}
        response={combinedResponse}
        entity={entity}
        showNoQuestionsBtn={showNoQuestionsBtn}
        entityPage={entity !== undefined}
        tags={tags}
        type={type}
        onRankUpdate={() => retry()}
        collectionId={props.collectionId}
        allowRanking={allowRanking}
        hasMore={hasMore}
        loadNextPage={loadNextPage}
      />
    </Box>
  );
};
