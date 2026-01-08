import { AnswerResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { getFiltersWithDateRange } from '../../utils/utils';
import { AnswerFilters } from '../FilterPanel/FilterPanel';
import {
  QetaEntityContainer,
  QetaEntityContainerProps,
} from '../QetaEntityContainer/QetaEntityContainer';
import { AnswerListItem } from './AnswerListItem';
import { AnswersGridItem } from './AnswersGridItem';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';

export interface AnswersContainerProps {
  tags?: string[];
  author?: string;
  entity?: string;
  showFilters?: boolean;
  showTitle?: boolean;
  title?: string;
  prefix?: string;
}

export const AnswersContainer = (props: AnswersContainerProps) => {
  const { tags, author, entity, showFilters, title, showTitle, prefix } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  const fetchAnswers: QetaEntityContainerProps<
    AnswerResponse,
    AnswerFilters
  >['fetch'] = async (api, limit, offset, filters) => {
    return api
      .getAnswers({
        limit,
        offset,
        author,
        ...(getFiltersWithDateRange(filters) as any),
      })
      .then(response => ({
        items: response.answers,
        total: response.total,
      }));
  };

  let resolvedTitle: React.ReactNode = title;
  if (author) {
    resolvedTitle = (
      <>
        {t('answerContainer.title.answersBy', {})}{' '}
        <EntityRefLink entityRef={author} hideIcon defaultKind="user" />
      </>
    );
  } else if (entity) {
    resolvedTitle = (
      <>
        {t('answerContainer.title.answersAbout', {})}{' '}
        <EntityRefLink entityRef={entity} />
      </>
    );
  } else if (tags) {
    resolvedTitle = t('answerContainer.title.answersTagged', {
      tags: tags.join(', '),
    });
  }

  return (
    <QetaEntityContainer<AnswerResponse, AnswerFilters>
      prefix={prefix ?? 'answers'}
      fetch={fetchAnswers}
      renderListItem={(answer: AnswerResponse) => (
        <AnswerListItem answer={answer} entity={entity} />
      )}
      renderGridItem={(answer: AnswerResponse) => (
        <AnswersGridItem answer={answer} entity={entity} />
      )}
      defaultView="list"
      filterPanelProps={
        showFilters ?? true
          ? {
              answerFilters: true,
            }
          : undefined
      }
      initialFilters={{
        order: 'desc',
        orderBy: 'created',
        searchQuery: '',
        dateRange: '',
        entities: entity ? [entity] : undefined,
        tags: tags ?? [],
        noVotes: 'false',
      }}
      filterKeys={[
        'orderBy',
        'searchQuery',
        'dateRange',
        'noVotes',
        'tags',
        'entities',
      ]}
      title={showTitle ? resolvedTitle : undefined}
      defaultPageSize={25}
    />
  );
};
