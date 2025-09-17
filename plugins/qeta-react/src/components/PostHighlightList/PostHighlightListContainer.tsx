import Whatshot from '@material-ui/icons/Whatshot';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { PostHighlightList } from './PostHighlightList';
import { PostsQuery } from '@drodil/backstage-plugin-qeta-common';

export const PostHighlightListContainer = ({ options }: { options?: PostsQuery }) => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const icon = <Whatshot fontSize="small" />;
  return (
    <>
      <PostHighlightList
        type="hot"
        title={t('highlights.hotQuestions.title')}
        noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
        icon={icon}
        options={options}
        postType="question"
      />
      <PostHighlightList
        type="hot"
        title={t('highlights.hotArticles.title')}
        noQuestionsLabel={t('highlights.hotArticles.noArticlesLabel')}
        icon={icon}
        options={options}
        postType="article"
      />
      <PostHighlightList
        type="hot"
        title={t('highlights.hotLinks.title')}
        noQuestionsLabel={t('highlights.hotLinks.noLinksLabel')}
        icon={icon}
        options={options}
        postType="link"
      />
    </>
  );
};
