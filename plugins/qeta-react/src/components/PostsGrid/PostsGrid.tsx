import React from 'react';
import { useTranslation } from '../../utils';
import { PaginatedPostsProps, usePaginatedPosts } from '../../utils/hooks';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import {
  AskQuestionButton,
  EntityFollowButton,
  TagFollowButton,
  WriteArticleButton,
} from '../Buttons';
import {
  Box,
  Button,
  Collapse,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import FilterList from '@material-ui/icons/FilterList';
import { FilterPanel } from '../FilterPanel/FilterPanel';
import { PostsGridContent } from './PostsGridContent';

export const PostsGrid = (props: PaginatedPostsProps) => {
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
  const { t } = useTranslation();
  const {
    onSearchQueryChange,
    filters,
    response,
    loading,
    error,
    setShowFilterPanel,
    showFilterPanel,
    onFilterChange,
    page,
    pageCount,
    onPageChange,
  } = usePaginatedPosts({ initialPageSize: 50, ...props });

  const itemType = (type ?? 'post') as any;
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
    shownTitle = t(`postsContainer.title.tagged`, {
      tags: tags.join(', '),
      itemType,
    });
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
          style={{ marginBottom: '1.5rem' }}
        >
          {shownTitle} {link} {btn}
        </Typography>
      )}
      <Grid container justifyContent="space-between">
        <Grid item xs={12} md={4}>
          <TextField
            id="search-bar"
            fullWidth
            onChange={onSearchQueryChange}
            label={t('postsContainer.search.label', { itemType })}
            className="qetaPostsGridSearchInput"
            variant="outlined"
            placeholder={t('postsContainer.search.placeholder')}
            size="small"
            style={{ marginBottom: '5px' }}
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
        <Grid item>
          <Typography variant="h6" className="qetaPostsContainerQuestionCount">
            {t('common.posts', { count: response?.total ?? 0, itemType })}
          </Typography>
        </Grid>
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
      {(showFilters ?? true) && (
        <Collapse in={showFilterPanel}>
          <FilterPanel
            onChange={onFilterChange}
            filters={filters}
            type={type}
          />
        </Collapse>
      )}
      <PostsGridContent
        loading={loading}
        error={error}
        response={response}
        entity={entity}
        showNoQuestionsBtn={showNoQuestionsBtn}
        entityPage={entity !== undefined}
        tags={tags}
        type={type}
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
      />
    </Box>
  );
};
