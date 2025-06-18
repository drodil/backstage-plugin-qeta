import { useQetaApi } from '../../hooks';
import { ReactNode } from 'react';
import {
  DraftPostSuggestion,
  NewArticleSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  SuggestionsResponse,
  SuggestionType,
} from '@drodil/backstage-plugin-qeta-common';
import AssistantIcon from '@material-ui/icons/Assistant';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import CheckIcon from '@material-ui/icons/Check';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import RefreshIcon from '@material-ui/icons/Refresh';
import { useNavigate } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, questionRouteRef } from '../../routes';
import {
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
  },
  header: {
    paddingBottom: theme.spacing(1),
  },
  listItem: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    transition: 'background-color 0.2s ease',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  listItemText: {
    marginTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
  },
  listItemIcon: {
    minWidth: theme.spacing(5),
    paddingLeft: theme.spacing(1),
  },
  timestamp: {
    color: theme.palette.text.secondary,
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
}));

const SuggestionListItem = (props: {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  timestamp?: ReactNode;
}) => {
  const navigate = useNavigate();
  const classes = useStyles();
  return (
    <ListItem
      button
      onClick={() => navigate(props.href)}
      className={classes.listItem}
    >
      {props.icon && (
        <ListItemIcon className={classes.listItemIcon}>
          {props.icon}
        </ListItemIcon>
      )}
      <ListItemText
        primary={props.children}
        secondary={props.timestamp}
        className={classes.listItemText}
      />
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
      timestamp={
        <RelativeTimeWithTooltip value={suggestion.question.created} />
      }
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
      timestamp={
        <RelativeTimeWithTooltip value={suggestion.question.created} />
      }
    >
      {t('suggestionsCard.newQuestion', {
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
  const route =
    suggestion.post.type === 'question' ? questionRoute : articleRoute;
  return (
    <SuggestionListItem
      href={route({ id: suggestion.post.id.toString(10) })}
      icon={<HelpOutlinedIcon />}
      timestamp={<RelativeTimeWithTooltip value={suggestion.post.created} />}
    >
      {t('suggestionsCard.draftPost', {
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
  return (
    <SuggestionListItem
      href={articleRoute({ id: suggestion.article.id.toString(10) })}
      icon={<CollectionsBookmarkIcon />}
      timestamp={<RelativeTimeWithTooltip value={suggestion.article.created} />}
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
  draftPost: DraftPostSuggestionItem,
};

export const SuggestionsCard = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();
  const {
    value: response,
    loading,
    retry,
  } = useQetaApi<SuggestionsResponse>(api => api.getSuggestions(), []);

  const suggestions = response?.suggestions ?? [];

  const handleRefresh = () => {
    retry();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={classes.loadingContainer}>
          <CircularProgress size={24} />
        </div>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className={classes.emptyState}>
          <Typography variant="body1">
            {t('suggestionsCard.noSuggestions')}
          </Typography>
        </div>
      );
    }

    return (
      <List>
        {suggestions.map((suggestion, index) => {
          const SuggestionComponent = suggestionTypeMap[suggestion.type];
          return (
            <div key={suggestion.id}>
              <SuggestionComponent suggestion={suggestion} />
              {index < suggestions.length - 1 && <Divider />}
            </div>
          );
        })}
      </List>
    );
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={t('suggestionsCard.title')}
        avatar={<AssistantIcon />}
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        }
      />
      <Divider />
      {renderContent()}
    </Card>
  );
};
