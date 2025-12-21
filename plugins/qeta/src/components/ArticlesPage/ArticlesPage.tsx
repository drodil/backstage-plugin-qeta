import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ContentHeader,
  PostsGrid,
  PostsContainer,
  qetaTranslationRef,
  WriteArticleButton,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import LibraryBooksOutlined from '@material-ui/icons/LibraryBooksOutlined';
import { Typography } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const ArticlesPage = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewType>('grid');

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
            <LibraryBooksOutlined
              fontSize="large"
              style={{ marginRight: '8px' }}
            />
            {t('articlesPage.title')}
          </Typography>
        }
      >
        <WriteArticleButton entity={entityRef} tags={tags} />
      </ContentHeader>
      {view === 'grid' ? (
        <PostsGrid type="article" view={view} onViewChange={setView} />
      ) : (
        <PostsContainer type="article" view={view} onViewChange={setView} />
      )}
    </>
  );
};
