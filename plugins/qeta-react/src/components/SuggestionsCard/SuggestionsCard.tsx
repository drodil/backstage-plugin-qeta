import { useQetaApi } from '../../hooks';
import { ReactNode, useMemo } from 'react';
import { Skeleton } from '@material-ui/lab';
import {
  DraftPostSuggestion,
  NewArticleSuggestion,
  NewLinkSuggestion,
  NewQuestionSuggestion,
  NoCorrectAnswerSuggestion,
  selectByPostType,
  SuggestionsResponse,
  SuggestionType,
} from '@drodil/backstage-plugin-qeta-common';
import AssistantIcon from '@material-ui/icons/Assistant';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import CheckIcon from '@material-ui/icons/Check';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import LinkIcon from '@material-ui/icons/Link';
import RefreshIcon from '@material-ui/icons/Refresh';
import { Link as RouterLink } from 'react-router-dom';
import { useRouteRef } from '@backstage/core-plugin-api';
import { articleRouteRef, linkRouteRef, questionRouteRef } from '../../routes';
import {
  Card,
  CardHeader,
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
import { getPostDisplayDate } from '../../utils/utils';

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

const getRandomVariant = (key: string) => {
  return `${key}${Math.floor(Math.random() * 5) + 1}`;
};

const SuggestionListItem = (props: {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  timestamp?: ReactNode;
}) => {
  const classes = useStyles();
  return (
    <ListItem
      button
      component={RouterLink}
      to={props.href}
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
  const variant = useMemo(
    () => getRandomVariant('suggestionsCard.noCorrectAnswer'),
    [],
  );
  return (
    <SuggestionListItem
      href={questionRoute({ id: suggestion.question.id.toString(10) })}
      icon={<CheckIcon />}
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
      icon={<HelpOutlinedIcon />}
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
      icon={<HelpOutlinedIcon />}
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
      icon={<CollectionsBookmarkIcon />}
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
      icon={<LinkIcon />}
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
      icon={<HelpOutlinedIcon />}
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
        <List>
          {Array.from(new Array(5)).map((_, index) => (
            <ListItem key={index} className={classes.listItem}>
              <ListItemIcon className={classes.listItemIcon}>
                <Skeleton variant="circle" width={24} height={24} />
              </ListItemIcon>
              <ListItemText
                primary={<Skeleton variant="text" width="80%" />}
                secondary={<Skeleton variant="text" width="40%" />}
                className={classes.listItemText}
              />
            </ListItem>
          ))}
        </List>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className={classes.emptyState}>
          <AssistantIcon style={{ fontSize: 40 }} />
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
