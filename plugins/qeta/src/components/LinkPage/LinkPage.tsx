import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignal } from '@backstage/plugin-signals-react';
import { ContentHeader, WarningPanel } from '@backstage/core-components';
import { QetaSignal } from '@drodil/backstage-plugin-qeta-common';
import {
  ButtonContainer,
  CreateLinkButton,
  LinkCard,
  qetaTranslationRef,
  useQetaApi,
} from '@drodil/backstage-plugin-qeta-react';
import { Skeleton } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const LinkPage = () => {
  const { id } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);

  const [views, setViews] = useState(0);

  console.log(views);

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

  return (
    <>
      <ContentHeader title={post.title}>
        <ButtonContainer>
          <CreateLinkButton />
        </ButtonContainer>
      </ContentHeader>
      <LinkCard link={post} />
    </>
  );
};
