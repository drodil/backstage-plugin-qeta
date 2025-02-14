import React from 'react';
import {
  CommonFilterPanelProps,
  FilterPanel,
  PostFilters,
} from '../FilterPanel/FilterPanel';
import { PostList } from './PostList';
import { AskQuestionButton } from '../Buttons/AskQuestionButton';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import { EntityFollowButton } from '../Buttons/EntityFollowButton';
import { WriteArticleButton } from '../Buttons';
import { capitalize } from 'lodash';
import {
  PaginatedPostsProps,
  usePaginatedPosts,
} from '../../hooks/usePaginatedPosts';
import { useTranslation } from '../../hooks';
import { SearchBar } from '../SearchBar/SearchBar';
import { Box, Button, Collapse, Grid, Typography } from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';

export const PostsContainer = (
  props: PaginatedPostsProps & {
    entity?: string;
    filterPanelProps?: CommonFilterPanelProps;
  },
) => {
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
    showNoQuestionsBtn,
  } = props;
  const {
    onSearchQueryChange,
    filters,
    response,
    loading,
    error,
    setShowFilterPanel,
    showFilterPanel,
    onFilterChange,
    onPageChange,
    onPageSizeChange,
    page,
    postsPerPage,
    pageCount,
  } = usePaginatedPosts(props);
  const { t } = useTranslation();

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
    shownTitle = t('postsContainer.title.favorite', {
      itemType: itemType.toLowerCase(),
    });
  }

  return (
    <Box className="qetaPostsContainer">
      {showTitle && (
        <Typography
          variant="h5"
          className="qetaPostsContainerTitle"
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
      </Grid>
      <Grid container justifyContent="space-between">
        {response && (
          <Grid item>
            <Typography
              variant="h6"
              className="qetaPostsContainerQuestionCount"
            >
              {t('common.posts', { count: response?.total ?? 0, itemType })}
            </Typography>
          </Grid>
        )}
        {response && (showFilters ?? true) && (
          <Grid item>
            <Button
              onClick={() => {
                setShowFilterPanel(!showFilterPanel);
              }}
              className="qetaPostsContainerFilterPanelBtn"
              startIcon={<FilterList />}
            >
              {t('filterPanel.filterButton')}
            </Button>
          </Grid>
        )}
      </Grid>
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel<PostFilters>
            onChange={onFilterChange}
            filters={filters}
            type={type}
            showEntityFilter={entity === undefined}
            {...props.filterPanelProps}
          />
        </Collapse>
      )}
      <PostList
        loading={loading}
        error={error}
        response={response}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        entity={entity ?? filters.entity}
        page={page}
        pageSize={postsPerPage}
        pageCount={pageCount}
        showNoQuestionsBtn={showNoQuestionsBtn}
        entityPage={entity !== undefined}
        tags={tags ?? filters.tags}
        type={type}
      />
    </Box>
  );
};
