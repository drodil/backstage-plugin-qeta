import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ContentHeader,
  PostsContainer,
  qetaTranslationRef,
  useQetaConfig,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { filterTags } from '@drodil/backstage-plugin-qeta-common';
import { RiBookOpenLine } from '@remixicon/react';
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
      <ContentHeader
        title={t('articlesPage.title')}
        titleIcon={<RiBookOpenLine size={24} />}
      >
        <WriteArticleButton entity={entityRef} tags={tags} />
      </ContentHeader>
      <PostsContainer type="article" defaultView="grid" />
    </>
  );
};
