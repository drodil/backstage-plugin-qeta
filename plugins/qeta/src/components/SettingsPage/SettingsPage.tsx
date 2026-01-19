import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  FormControlLabel,
  makeStyles,
  Switch,
  Typography,
  useTheme,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import {
  qetaTranslationRef,
  useAI,
  useUserSettings,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  settingItem: {
    marginBottom: theme.spacing(2),
  },
  description: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
  },
  viewTypeItem: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewTypeLabel: {
    minWidth: '200px',
  },
}));

export const SettingsPage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const {
    settings,
    setSetting,
    getSetting,
    resetSettings,
    isLoaded,
    updateSettings,
  } = useUserSettings();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { isAIEnabled } = useAI();
  const configApi = useApi(configApiRef);
  const allowAnonymous = configApi.getOptionalBoolean('qeta.allowAnonymous');

  const viewTypes = [
    {
      key: 'posts-question',
      label: t('settingsPage.viewTypePreferences.labels.questions', {}),
    },
    {
      key: 'posts-article',
      label: t('settingsPage.viewTypePreferences.labels.articles', {}),
    },
    {
      key: 'posts-link',
      label: t('settingsPage.viewTypePreferences.labels.links', {}),
    },
    {
      key: 'favorites',
      label: t('settingsPage.viewTypePreferences.labels.favorites', {}),
    },
    {
      key: 'collections',
      label: t('settingsPage.viewTypePreferences.labels.collections', {}),
    },
    {
      key: 'tags',
      label: t('settingsPage.viewTypePreferences.labels.tags', {}),
    },
    {
      key: 'users',
      label: t('settingsPage.viewTypePreferences.labels.users', {}),
    },
    {
      key: 'entities',
      label: t('settingsPage.viewTypePreferences.labels.entities', {}),
    },
    {
      key: 'tag-posts',
      label: t('settingsPage.viewTypePreferences.labels.tagPosts', {}),
    },
    {
      key: 'collection-posts',
      label: t('settingsPage.viewTypePreferences.labels.collectionPosts', {}),
    },
    {
      key: 'user-questions',
      label: t('settingsPage.viewTypePreferences.labels.userQuestions', {}),
    },
    {
      key: 'user-articles',
      label: t('settingsPage.viewTypePreferences.labels.userArticles', {}),
    },
    {
      key: 'user-links',
      label: t('settingsPage.viewTypePreferences.labels.userLinks', {}),
    },
    {
      key: 'user-collections',
      label: t('settingsPage.viewTypePreferences.labels.userCollections', {}),
    },
    {
      key: 'user-answers',
      label: t('settingsPage.viewTypePreferences.labels.userAnswers', {}),
    },
  ];

  const handleViewTypeChange = (key: string, value: ViewType | null) => {
    if (value === null) {
      updateSettings({
        viewType: { ...getSetting('viewType'), [key]: undefined as any },
      });
    } else {
      updateSettings({
        viewType: { ...getSetting('viewType'), [key]: value },
      });
    }
  };

  const getViewType = (key: string): ViewType | null => {
    return settings.viewType[key] || null;
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <InfoCard title={t('settingsPage.title', {})} data-testid="settings-page">
      <CardContent>
        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t('settingsPage.editorPreferences', {})}
          </Typography>

          <div className={classes.settingItem} data-testid="auto-save-setting">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSaveEnabled}
                  onChange={e =>
                    setSetting('autoSaveEnabled', e.target.checked)
                  }
                  color="primary"
                  data-testid="auto-save-switch"
                />
              }
              label={t('settingsPage.autoSave.label', {})}
            />
            <Typography className={classes.description}>
              {t('settingsPage.autoSave.description', {})}
            </Typography>
          </div>

          {allowAnonymous && (
            <div
              className={classes.settingItem}
              data-testid="anonymous-posting-setting"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.anonymousPosting}
                    onChange={e =>
                      setSetting('anonymousPosting', e.target.checked)
                    }
                    color="primary"
                    data-testid="anonymous-posting-switch"
                  />
                }
                label={t('settingsPage.anonymousPosting.label', {})}
              />
              <Typography className={classes.description}>
                {t('settingsPage.anonymousPosting.description', {})}
              </Typography>
            </div>
          )}
        </div>

        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            {t('settingsPage.displayPreferences', {})}
          </Typography>

          {isAIEnabled && (
            <div
              className={classes.settingItem}
              data-testid="ai-answer-setting"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.aiAnswerExpanded}
                    onChange={e =>
                      setSetting('aiAnswerExpanded', e.target.checked)
                    }
                    color="primary"
                    data-testid="ai-answer-switch"
                  />
                }
                label={t('settingsPage.aiAnswerExpanded.label', {})}
              />
              <Typography className={classes.description}>
                {t('settingsPage.aiAnswerExpanded.description', {})}
              </Typography>
            </div>
          )}

          <div className={classes.settingItem} data-testid="pagination-setting">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.usePagination}
                  onChange={e => setSetting('usePagination', e.target.checked)}
                  color="primary"
                  data-testid="pagination-switch"
                />
              }
              label={t('settingsPage.usePagination.label', {})}
            />
            <Typography className={classes.description}>
              {t('settingsPage.usePagination.description', {})}
            </Typography>
          </div>

          <Box mt={3}>
            <Typography
              variant="subtitle1"
              style={{ fontWeight: 500, marginBottom: 16 }}
            >
              {t('settingsPage.viewTypePreferences.title', {})}
            </Typography>
            <Typography
              className={classes.description}
              style={{ marginBottom: 16 }}
            >
              {t('settingsPage.viewTypePreferences.description', {})}
            </Typography>

            {viewTypes.map(({ key, label }) => {
              const currentView = getViewType(key);
              return (
                <div
                  key={key}
                  className={classes.viewTypeItem}
                  data-testid={`view-type-${key}`}
                >
                  <Typography className={classes.viewTypeLabel}>
                    {label}
                  </Typography>
                  <ButtonGroup size="small" color="primary">
                    <Button
                      variant={
                        currentView === 'grid' ? 'contained' : 'outlined'
                      }
                      onClick={() => handleViewTypeChange(key, 'grid')}
                      data-testid={`view-type-${key}-grid`}
                      data-selected={currentView === 'grid'}
                    >
                      {t('settingsPage.viewTypePreferences.grid', {})}
                    </Button>
                    <Button
                      variant={
                        currentView === 'list' ? 'contained' : 'outlined'
                      }
                      onClick={() => handleViewTypeChange(key, 'list')}
                      data-testid={`view-type-${key}-list`}
                      data-selected={currentView === 'list'}
                    >
                      {t('settingsPage.viewTypePreferences.list', {})}
                    </Button>
                    <Button
                      variant={currentView === null ? 'contained' : 'outlined'}
                      onClick={() => handleViewTypeChange(key, null)}
                      data-testid={`view-type-${key}-default`}
                      data-selected={currentView === null}
                    >
                      {t('settingsPage.viewTypePreferences.default', {})}
                    </Button>
                  </ButtonGroup>
                </div>
              );
            })}
          </Box>
        </div>

        <Box mt={4} pt={3} borderTop={`1px solid ${theme.palette.divider}`}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              resetSettings();
            }}
            data-testid="reset-all-settings-button"
          >
            {t('settingsPage.resetAllSettings', {})}
          </Button>
          <Typography
            className={classes.description}
            style={{ marginTop: theme.spacing(1) }}
          >
            {t('settingsPage.resetAllSettingsDescription', {})}
          </Typography>
        </Box>
      </CardContent>
    </InfoCard>
  );
};
