import { useQetaApi, useQetaConfig } from '../../hooks';
import { ReactElement, ReactNode, useMemo } from 'react';
import {
  DraftPostSuggestion,
  NeedsReviewSuggestion,
  NewArticleSuggestion,
  NewLinkSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  selectByPostType,
  SuggestionsResponse,
  SuggestionType,
} from '@drodil/backstage-plugin-qeta-common';
import {
  RiSparklingLine,
  RiQuestionLine,
  RiCheckLine,
  RiBook2Line,
  RiLinkM,
  RiRefreshLine,
  RiEditLine,
} from '@remixicon/react';
import { Link as RouterLink } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import {
  ButtonIcon,
  Card,
  CardBody,
  CardHeader,
  Flex,
  List,
  ListRow,
  Skeleton,
  Text,
} from '@backstage/ui';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { getPostDisplayDate } from '../../utils/utils';
import styles from './SuggestionsCard.module.css';

const getRandomVariant = (key: string) => {
  return `${key}${Math.floor(Math.random() * 5) + 1}`;
};

const SuggestionListItem = (props: {
  children: ReactNode;
  href: string;
  icon?: ReactElement;
  timestamp?: ReactNode;
}) => {
  return (
    <RouterLink to={props.href} className={styles.link}>
      <List>
        <ListRow icon={props.icon} className={styles.listRow}>
          <div className={styles.itemContent}>
            <Text className={styles.primaryText}>{props.children}</Text>
            {props.timestamp && (
              <Text variant="body-x-small" color="secondary">
                {props.timestamp}
              </Text>
            )}
          </div>
        </ListRow>
      </List>
    </RouterLink>
  );
};

const NoCorrectAnswerSuggestionItem = (props: {
  suggestion: NoCorrectAnswerSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.noCorrectAnswer'),
    [],
  );
  return (
    <SuggestionListItem
      href={questionRoute({ id: suggestion.question.id.toString(10) })}
      icon={<RiCheckLine size={16} />}
      timestamp={
        <RelativeTimeWithTooltip value={suggestion.question.created} />
      }
    >
      {t(variant as any, {
        title: suggestion.question.title,
      })}
    </SuggestionListItem>
  );
};

const NewQuestionSuggestionItem = (props: {
  suggestion: NewQuestionSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.newQuestion'),
    [],
  );
  return (
    <SuggestionListItem
      href={questionRoute({ id: suggestion.question.id.toString(10) })}
      icon={<RiQuestionLine size={16} />}
      timestamp={
        <RelativeTimeWithTooltip value={suggestion.question.created} />
      }
    >
      {t(variant as any, {
        title: suggestion.question.title,
      })}
    </SuggestionListItem>
  );
};

const DraftPostSuggestionItem = (props: {
  suggestion: DraftPostSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const route = selectByPostType(
    suggestion.post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.draftPost'),
    [],
  );
  return (
    <SuggestionListItem
      href={route({ id: suggestion.post.id.toString(10) })}
      icon={<RiQuestionLine size={16} />}
      timestamp={<RelativeTimeWithTooltip value={suggestion.post.created} />}
    >
      {t(variant as any, {
        title: suggestion.post.title,
      })}
    </SuggestionListItem>
  );
};

const NewArticleSuggestionItem = (props: {
  suggestion: NewArticleSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.newArticle'),
    [],
  );
  return (
    <SuggestionListItem
      href={articleRoute({ id: suggestion.article.id.toString(10) })}
      icon={<RiBook2Line size={16} />}
      timestamp={
        <RelativeTimeWithTooltip
          value={getPostDisplayDate(suggestion.article)}
        />
      }
    >
      {t(variant as any, {
        title: suggestion.article.title,
      })}
    </SuggestionListItem>
  );
};

const NewLinkSuggestionItem = (props: { suggestion: NewLinkSuggestion }) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.newLink'),
    [],
  );
  return (
    <SuggestionListItem
      href={linkRoute({ id: suggestion.link.id.toString(10) })}
      icon={<RiLinkM size={16} />}
      timestamp={
        <RelativeTimeWithTooltip value={getPostDisplayDate(suggestion.link)} />
      }
    >
      {t(variant as any, {
        title: suggestion.link.title,
      })}
    </SuggestionListItem>
  );
};

const RandomPostSuggestionItem = (props: {
  suggestion: DraftPostSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const route = selectByPostType(
    suggestion.post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.randomPost'),
    [],
  );
  return (
    <SuggestionListItem
      href={route({ id: suggestion.post.id.toString(10) })}
      icon={<RiQuestionLine size={16} />}
      timestamp={<RelativeTimeWithTooltip value={suggestion.post.created} />}
    >
      {t(variant as any, {
        title: suggestion.post.title,
      })}
    </SuggestionListItem>
  );
};

const NeedsReviewSuggestionItem = (props: {
  suggestion: NeedsReviewSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  const articleRoute = useRouteRef(articleRouteRef);
  const linkRoute = useRouteRef(linkRouteRef);
  const route = selectByPostType(
    suggestion.post.type,
    questionRoute,
    articleRoute,
    linkRoute,
  );
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.needsReview'),
    [],
  );
  return (
    <SuggestionListItem
      href={route({ id: suggestion.post.id.toString(10) })}
      icon={<RiEditLine size={16} />}
      timestamp={<RelativeTimeWithTooltip value={suggestion.post.created} />}
    >
      {t(variant as any, {
        title: suggestion.post.title,
      })}
    </SuggestionListItem>
  );
};

const suggestionTypeMap: Record<SuggestionType, any> = {
  noCorrectAnswer: NoCorrectAnswerSuggestionItem,
  newQuestion: NewQuestionSuggestionItem,
  newArticle: NewArticleSuggestionItem,
  newLink: NewLinkSuggestionItem,
  draftPost: DraftPostSuggestionItem,
  randomPost: RandomPostSuggestionItem,
  needsReview: NeedsReviewSuggestionItem,
};

export const SuggestionsCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const {
    value: response,
    loading,
    retry,
  } = useQetaApi<SuggestionsResponse>(api => api.getSuggestions(), []);

  const suggestions = (response?.suggestions ?? []).filter(suggestion => {
    switch (suggestion.type) {
      case 'newQuestion':
      case 'noCorrectAnswer':
        return !disabled.questions;
      case 'newArticle':
        return !disabled.articles;
      case 'newLink':
        return !disabled.links;
      case 'draftPost':
      case 'randomPost':
      case 'needsReview': {
        const post = (suggestion as { post?: { type?: string } }).post;
        return post
          ? !(
              (post.type === 'question' && disabled.questions) ||
              (post.type === 'article' && disabled.articles) ||
              (post.type === 'link' && disabled.links)
            )
          : true;
      }
      default:
        return true;
    }
  });

  if (disabled.questions && disabled.articles && disabled.links) {
    return null;
  }

  const handleRefresh = () => {
    retry();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          {Array.from(new Array(5)).map((_, index) => (
            <List key={index}>
              <ListRow icon={<Skeleton rounded width={24} height={24} />}>
                <div className={styles.itemContent}>
                  <Skeleton width="80%" height={16} />
                  <Skeleton width="40%" height={12} />
                </div>
              </ListRow>
            </List>
          ))}
        </>
      );
    }

    if (suggestions.length === 0) {
      return (
        <Flex direction="column" align="center" className={styles.emptyState}>
          <RiSparklingLine size={40} />
          <Text variant="body-medium">
            {t('suggestionsCard.noSuggestions')}
          </Text>
        </Flex>
      );
    }

    return (
      <>
        {suggestions.map(suggestion => {
          const SuggestionComponent = suggestionTypeMap[suggestion.type];
          return (
            <SuggestionComponent key={suggestion.id} suggestion={suggestion} />
          );
        })}
      </>
    );
  };

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <RiSparklingLine size={20} />
            <Text variant="title-small">{t('suggestionsCard.title')}</Text>
          </Flex>
          <ButtonIcon
            aria-label={t('suggestionsCard.title')}
            icon={<RiRefreshLine size={16} />}
            variant="tertiary"
            isDisabled={loading}
            onPress={handleRefresh}
          />
        </Flex>
      </CardHeader>
      <CardBody className={styles.body}>{renderContent()}</CardBody>
    </Card>
  );
};
