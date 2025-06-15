import { useQetaApi } from '../../hooks';
import { ReactNode } from 'react';
import {
  NewArticleSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  SuggestionType,
} from '@drodil/backstage-plugin-qeta-common';
import AssistantIcon from '@material-ui/icons/Assistant';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import CheckIcon from '@material-ui/icons/Check';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import {
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
} from '@material-ui/core';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

const SuggestionListItem = (props: {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
}) => {
  const navigate = useNavigate();
  return (
    <ListItem button onClick={() => navigate(props.href)}>
      {props.icon && <ListItemIcon>{props.icon}</ListItemIcon>}
      {props.children}
    </ListItem>
  );
};

const NoCorrectAnswerSuggestionItem = (props: {
  suggestion: NoCorrectAnswerSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const questionRoute = useRouteRef(questionRouteRef);
  return (
    <SuggestionListItem
      href={questionRoute({ id: suggestion.question.id.toString(10) })}
      icon={<CheckIcon />}
    >
      {t('suggestionsCard.noCorrectAnswer', {
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
  return (
    <SuggestionListItem
      href={questionRoute({ id: suggestion.question.id.toString(10) })}
      icon={<HelpOutlinedIcon />}
    >
      {t('suggestionsCard.newQuestion', {
        title: suggestion.question.title,
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
  return (
    <SuggestionListItem
      href={articleRoute({ id: suggestion.article.id.toString(10) })}
      icon={<CollectionsBookmarkIcon />}
    >
      {t('suggestionsCard.newArticle', {
        title: suggestion.article.title,
      })}
    </SuggestionListItem>
  );
};

const suggestionTypeMap: Record<SuggestionType, any> = {
  noCorrectAnswer: NoCorrectAnswerSuggestionItem,
  newQuestion: NewQuestionSuggestionItem,
  newArticle: NewArticleSuggestionItem,
};

export const SuggestionsCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { value: response } = useQetaApi(api => api.getSuggestions(), []);

  const suggestions = response?.suggestions ?? [];
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        style={{ paddingBottom: '8px' }}
        title={t('suggestionsCard.title')}
        avatar={<AssistantIcon />}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <List>
        {suggestions.map(suggestion => {
          const SuggestionComponent = suggestionTypeMap[suggestion.type];
          return (
            <SuggestionComponent key={suggestion.id} suggestion={suggestion} />
          );
        })}
      </List>
    </Card>
  );
};
