import { PostType } from '@drodil/backstage-plugin-qeta-common';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export type QetaConfigSection =
  | 'questions'
  | 'articles'
  | 'links'
  | 'collections'
  | 'tags'
  | 'entities'
  | 'statistics'
  | 'userStatistics';

const postTypeToSection: Record<PostType, QetaConfigSection> = {
  question: 'questions',
  article: 'articles',
  link: 'links',
};

export const useQetaConfig = () => {
  const configApi = useApi(configApiRef);

  const isSectionDisabled = (section: QetaConfigSection) =>
    configApi.getOptionalBoolean(
      section === 'userStatistics'
        ? 'qeta.statistics.users.disabled'
        : `qeta.${section}.disabled`,
    ) ?? false;

  const isPostTypeDisabled = (postType?: PostType) =>
    postType ? isSectionDisabled(postTypeToSection[postType]) : false;

  return {
    isSectionDisabled,
    isPostTypeDisabled,
    disabled: {
      questions: isSectionDisabled('questions'),
      articles: isSectionDisabled('articles'),
      links: isSectionDisabled('links'),
      collections: isSectionDisabled('collections'),
      tags: isSectionDisabled('tags'),
      entities: isSectionDisabled('entities'),
      statistics: isSectionDisabled('statistics'),
      userStatistics: isSectionDisabled('userStatistics'),
    },
    showLastSeen:
      configApi.getOptionalBoolean('qeta.statistics.users.lastSeen') ?? true,
  };
};
