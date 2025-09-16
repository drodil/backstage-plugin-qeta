import * as React from "react";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { PostResponse, QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  AddToCollectionButton,
  ButtonContainer,
  CreateLinkButton,
  DeletedBanner,
  DraftBanner,
  LinkCard,
  qetaTranslationRef,
  RelativeTimeWithTooltip,
  UpdatedByLink,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Box, makeStyles } from "@material-ui/core";

const useDescriptionStyles = makeStyles(
  () => ({
    root: {},
    box: {
      display: 'inline',
    },
  }),
  { name: 'QetaDescription' },
);

export const LinkPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const dStyles = useDescriptionStyles();
  const [views, setViews] = useState(0);
  const { lastSignal } = useSignal<QetaSignal>(`qeta:post_${id}`);

  const {
    value: post,
    loading,
    error,
  } = useQetaApi(api => api.getPost(id), [id]);

  useEffect(() => {
    if (post) {
      setViews(post.views);
    }
  }, [post]);

  useEffect(() => {
    if (lastSignal?.type === 'post_stats') {
      setViews(lastSignal.views);
    }
  }, [lastSignal]);

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  if (error || post === undefined) {
    return (
      <WarningPanel severity="error" title={t('linkPage.errorLoading')}>
        {error?.message}
      </WarningPanel>
    );
  }

  if (post.type !== 'link') {
    return (
      <WarningPanel title="Not found" message={t('linkPage.notFound')} />
    );
  }

  const getDescription = (q: PostResponse) => {
    return (
      <span className={dStyles.root}>
        <Box fontWeight="fontWeightMedium" className={dStyles.box}>
          {t('authorBox.postedAtTime')}{' '}
          <RelativeTimeWithTooltip value={q.created} />
          {' · '}
        </Box>
        {q.updated && (
          <React.Fragment>
            <Box fontWeight="fontWeightMedium" className={dStyles.box}>
              {t('authorBox.updatedAtTime')}{' '}
              <RelativeTimeWithTooltip value={q.updated} />{' '}
              {t('authorBox.updatedBy')} <UpdatedByLink entity={q} />
              {' · '}
            </Box>
          </React.Fragment>
        )}
        <Box fontWeight="fontWeightMedium" className={dStyles.box}>
          {t('common.viewsCount', { count: views })}
        </Box>
      </span>
    );
  };

  return (
    <>
      <ContentHeader
        // @ts-ignore
        title={post.url ? (
          <Box display="flex" alignItems="center">
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
              data-testid="link-title"
            >
              {post.title}
            </a>
          </Box>
        ) : post.title}
        // @ts-ignore
        description={getDescription(post)}
      >
        <ButtonContainer>
          <CreateLinkButton />
          <AddToCollectionButton post={post} />
        </ButtonContainer>
      </ContentHeader>
      {post.status === 'draft' && <DraftBanner />}
      {post.status === 'deleted' && <DeletedBanner />}
      <LinkCard link={post} />
    </>
  );
};
