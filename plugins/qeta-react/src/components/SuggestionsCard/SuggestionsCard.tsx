import { useQetaApi, useTranslation } from '../../hooks';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import React, { ReactNode } from 'react';
import {
  NewArticleSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  SuggestionType,
} from '@drodil/backstage-plugin-qeta-common';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import AssistantIcon from '@mui/icons-material/Assistant';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { useNavigate } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import ListItemIcon from '@mui/material/ListItemIcon';

const SuggestionListItem = (props: {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
}) => {
  const navigate = useNavigate();
  return (
    <ListItem sx={{ padding: 0 }}>
      <ListItemButton onClick={() => navigate(props.href)}>
        {props.icon && <ListItemIcon>{props.icon}</ListItemIcon>}
        {props.children}
      </ListItemButton>
    </ListItem>
  );
};

const NoCorrectAnswerSuggestionItem = (props: {
  suggestion: NoCorrectAnswerSuggestion;
}) => {
  const { suggestion } = props;
  const { t } = useTranslation();
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
  const { t } = useTranslation();
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
  const { t } = useTranslation();
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
  const { t } = useTranslation();
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
          return <SuggestionComponent suggestion={suggestion} />;
        })}
      </List>
    </Card>
  );
};
