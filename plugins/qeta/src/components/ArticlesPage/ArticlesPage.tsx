import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  PostsContainer,
  qetaTranslationRef,
  useQetaConfig,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const ArticlesPage = () => {
  const [searchParams] = useSearchParams();

  const [entityRef, setEntityRef] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  useEffect(() => {
    setEntityRef(searchParams.get('entity') ?? undefined);
    setTags(filterTags(searchParams.get('tags')));
  }, [searchParams, setEntityRef]);

  if (disabled.articles) {
    return null;
  }

  return (
    <>
      <Header
        title={t('articlesPage.title')}
        customActions={<WriteArticleButton entity={entityRef} tags={tags} />}
      />
      <PostsContainer type="article" defaultView="grid" />
    </>
  );
};
