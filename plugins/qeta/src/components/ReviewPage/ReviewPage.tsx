import { useState } from 'react';
import {
  articleRouteRef,
  DeleteModal,
  linkRouteRef,
  ObsoleteModal,
  qetaTranslationRef,
  questionRouteRef,
  RelativeTimeWithTooltip,
  useCanReview,
  useQetaApi,
  UserLink,
  ValidReviewModal,
} from '@drodil/backstage-plugin-qeta-react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  Link,
  Table,
  TableColumn,
  WarningPanel,
} from '@backstage/core-components';
import { Box, Grid, IconButton, Tooltip, Typography } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import DeleteIcon from '@material-ui/icons/Delete';
import { Post } from '@drodil/backstage-plugin-qeta-common';

export const ReviewPage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const {
    value: response,
    loading,
    error,
    retry,
  } = useQetaApi(api =>
    api.getPosts({
      reviewNeeded: true,
      includeHealth: true,
      includeVotes: false,
      includeAttachments: false,
      includeExperts: false,
      includeTags: false,
      order: 'asc',
      orderBy: 'created',
      includeEntities: false,
      includeAnswers: false,
      checkAccess: true,
    }),
  );

  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const { canReview } = useCanReview();

  const getPostLink = (post: Post) => {
    if (post.type === 'article') {
      return articleRoute({ id: post.id.toString() });
    }
    if (post.type === 'question') {
      return questionRoute({ id: post.id.toString() });
    }
    if (post.type === 'link') {
      return linkRoute({ id: post.id.toString() });
    }
    return '#';
  };

  const [openObsoleteModal, setOpenObsoleteModal] = useState(false);
  const [openValidModal, setOpenValidModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const openMarkObsolete = (post: Post) => {
    setSelectedPost(post);
    setOpenObsoleteModal(true);
  };

  const openMarkValid = (post: Post) => {
    setSelectedPost(post);
    setOpenValidModal(true);
  };

  const openDelete = (post: Post) => {
    setPostToDelete(post);
    setOpenDeleteModal(true);
  };

  const columns: TableColumn<Post>[] = [
    {
      title: t('reviewPage.table.title'),
      field: 'title',
      render: row => <Link to={getPostLink(row)}>{row.title}</Link>,
    },
    {
      title: t('reviewPage.table.author'),
      field: 'author',
      render: row => <UserLink entityRef={row.author} />,
    },
    {
      title: t('reviewPage.table.created'),
      field: 'created',
      render: row => <RelativeTimeWithTooltip value={row.created} />,
    },
    {
      title: t('reviewPage.table.healthScore'),
      field: 'healthScore',
      render: row => `${row.healthScore ?? 0}%`,
    },
    {
      title: t('reviewPage.table.actions'),
      field: 'actions',
      render: row => (
        <Grid container spacing={1}>
          <Grid item>
            <Tooltip title={t('contentHealth.markValid')}>
              <IconButton color="primary" onClick={() => openMarkValid(row)}>
                <CheckIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title={t('contentHealth.markObsolete')}>
              <IconButton
                color="secondary"
                onClick={() => openMarkObsolete(row)}
              >
                <BlockIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          {row.canDelete && (
            <Grid item>
              <Tooltip title={t('deleteModal.deleteButton')}>
                <IconButton color="secondary" onClick={() => openDelete(row)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      ),
    },
  ];

  if (!canReview) {
    return null;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title={t('reviewPage.errorLoading')}>
        {error.message}
      </WarningPanel>
    );
  }

  return (
    <>
      <Box mb={2}>
        <Typography variant="body1">{t('reviewPage.description')}</Typography>
      </Box>
      <Table
        options={{ paging: true, pageSize: 10, search: true }}
        data={response?.posts || []}
        columns={columns}
        title={t('reviewPage.title')}
        isLoading={loading}
      />

      {selectedPost && (
        <>
          <ObsoleteModal
            open={openObsoleteModal}
            onClose={() => {
              setOpenObsoleteModal(false);
              setSelectedPost(null);
            }}
            post={selectedPost}
            onConfirm={retry}
          />
          <ValidReviewModal
            open={openValidModal}
            onClose={() => {
              setOpenValidModal(false);
              setSelectedPost(null);
            }}
            post={selectedPost}
            onConfirm={retry}
          />
        </>
      )}

      {postToDelete && (
        <DeleteModal
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setPostToDelete(null);
          }}
          entity={postToDelete}
          onDelete={retry}
        />
      )}
    </>
  );
};
