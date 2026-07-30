import { useState } from 'react';
import { LinkButton, WarningPanel } from '@backstage/core-components';
import { PostsTableRow } from './PostsTableRow';
import { useQetaApi } from '../../hooks';
import { Box, Button, Flex, TablePagination, Text } from '@backstage/ui';
import { RiRefreshLine } from '@remixicon/react';
import { PostType } from '@drodil/backstage-plugin-qeta-common';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import styles from './PostsTable.module.css';

type QuickFilterType = 'latest' | 'favorites' | 'most_viewed';

export const PostsTable = (props: {
  hideTitle?: boolean;
  rowsPerPage?: number;
  quickFilter?: QuickFilterType;
  postType?: PostType;
}) => {
  const [page, setPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(
    props.rowsPerPage ?? 10,
  );
  const [quickFilter, setQuickFilter] = useState(props.quickFilter ?? 'latest');
  const [refresh, setRefresh] = useState(0);
  const { t } = useTranslationRef(qetaTranslationRef);
  const [filters, setFilters] = useState({
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
    searchQuery: '',
    favorite: false,
  });
  const {
    value: response,
    loading,
    error,
  } = useQetaApi(
    api =>
      api.getPosts({
        type: props.postType,
        limit: questionsPerPage,
        offset: (page - 1) * questionsPerPage,
        includeEntities: true,
        includeExperts: false,
        ...(filters as any),
      }),
    [page, filters, questionsPerPage, refresh],
  );

  const handleQuickFilterChange = (filter: QuickFilterType) => {
    setQuickFilter(filter);
    if (filter === 'latest') {
      setFilters({
        ...filters,
        order: 'desc',
        orderBy: 'created',
        favorite: false,
      });
    } else if (filter === 'favorites') {
      setFilters({
        ...filters,
        order: 'desc',
        orderBy: 'created',
        favorite: true,
      });
    } else if (filter === 'most_viewed') {
      setFilters({
        ...filters,
        order: 'desc',
        orderBy: 'views',
        favorite: false,
      });
    }
  };

  if (loading) {
    return <LoadingGrid />;
  }

  if (error || response === undefined) {
    return (
      <WarningPanel severity="error" title={t('postsTable.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  const offset = (page - 1) * questionsPerPage;

  return (
    <>
      <Flex
        align="center"
        justify="between"
        className={`${styles.header} qetaPostsTableGrid`}
      >
        <Box>
          {props.hideTitle === true ? null : (
            <Text variant="title-medium">{t('pluginName')}</Text>
          )}
        </Box>
        <Flex align="center" gap="2">
          <Flex align="center" gap="1" className={styles.quickFilters}>
            <Button
              variant={quickFilter === 'latest' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleQuickFilterChange('latest')}
            >
              {t('postsTable.latest')}
            </Button>
            <Button
              variant={quickFilter === 'favorites' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleQuickFilterChange('favorites')}
            >
              {t('postsTable.favorites')}
            </Button>
            <Button
              variant={quickFilter === 'most_viewed' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleQuickFilterChange('most_viewed')}
            >
              {t('postsTable.mostViewed')}
            </Button>
          </Flex>
          <LinkButton
            to="#"
            variant="text"
            onClick={() => setRefresh(refresh + 1)}
          >
            <RiRefreshLine size={16} />
          </LinkButton>
        </Flex>
      </Flex>
      <Box className={styles.tableContainer}>
        <table className={`${styles.table} qetaQuestionsTable`}>
          <thead>
            <tr>
              <th>{t('postsTable.cells.title')}</th>
              <th>{t('postsTable.cells.author')}</th>
              {props.postType === undefined && (
                <th>{t('postsTable.cells.type')}</th>
              )}
              <th>{t('postsTable.cells.asked')}</th>
              <th>{t('postsTable.cells.updated')}</th>
            </tr>
          </thead>
          <tbody>
            {response.posts.map(q => (
              <PostsTableRow
                key={q.id}
                post={q}
                showIcon={props.postType === undefined}
              />
            ))}
          </tbody>
        </table>
        <TablePagination
          pageSize={questionsPerPage}
          pageSizeOptions={[5, 10, 20, 30, 40, 50]}
          offset={offset}
          totalCount={response.total}
          hasPreviousPage={page > 1}
          hasNextPage={offset + questionsPerPage < response.total}
          onPreviousPage={() => setPage(p => Math.max(1, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
          onPageSizeChange={size => {
            setQuestionsPerPage(size);
            setPage(1);
          }}
        />
      </Box>
    </>
  );
};

/**
 * @deprecated Use `PostsTable` instead
 */
export const QuestionsTable = PostsTable;
