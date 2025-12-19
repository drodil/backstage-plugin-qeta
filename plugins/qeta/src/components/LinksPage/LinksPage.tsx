import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import {
  ButtonContainer,
  CreateLinkButton,
  PostsContainer,
  PostsGrid,
  qetaTranslationRef,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import LinkIcon from '@material-ui/icons/Link';
import { Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const LinksPage = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('list');

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  return (
    <>
      <ContentHeader
        titleComponent={
          <Typography
            variant="h4"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <LinkIcon fontSize="large" style={{ marginRight: '8px' }} />
            {t('linksPage.title')}
          </Typography>
        }
      >
        <ButtonContainer>
          <CreateLinkButton entity={entityRef} tags={tags} />
        </ButtonContainer>
      </ContentHeader>
      {view === 'grid' ? (
        <PostsGrid type="link" view={view} onViewChange={setView} />
      ) : (
        <PostsContainer type="link" view={view} onViewChange={setView} />
      )}
    </>
  );
};
