import {
  qetaTranslationRef,
  useAI,
  useUserSettings,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Switch,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from '@backstage/ui';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
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
    <Card data-testid="settings-page">
      <CardHeader>
        <Text as="h1" variant="title-small">
          {t('settingsPage.title', {})}
        </Text>
      </CardHeader>
      <CardBody>
        <Box className={styles.content}>
          <Box className={styles.section}>
            <Text as="h2" variant="title-small" className={styles.sectionTitle}>
              {t('settingsPage.editorPreferences', {})}
            </Text>

            <div className={styles.settingItem} data-testid="auto-save-setting">
              <Switch
                isSelected={settings.autoSaveEnabled}
                onChange={value => setSetting('autoSaveEnabled', value)}
                label={t('settingsPage.autoSave.label', {})}
                data-testid="auto-save-switch"
              />
              <Text
                as="div"
                variant="body-small"
                color="secondary"
                className={styles.description}
              >
                {t('settingsPage.autoSave.description', {})}
              </Text>
            </div>

            {allowAnonymous && (
              <div
                className={styles.settingItem}
                data-testid="anonymous-posting-setting"
              >
                <Switch
                  isSelected={settings.anonymousPosting}
                  onChange={value => setSetting('anonymousPosting', value)}
                  label={t('settingsPage.anonymousPosting.label', {})}
                  data-testid="anonymous-posting-switch"
                />
                <Text
                  as="div"
                  variant="body-small"
                  color="secondary"
                  className={styles.description}
                >
                  {t('settingsPage.anonymousPosting.description', {})}
                </Text>
              </div>
            )}
          </Box>

          <Box className={styles.section}>
            <Text as="h2" variant="title-small" className={styles.sectionTitle}>
              {t('settingsPage.displayPreferences', {})}
            </Text>

            {isAIEnabled && (
              <div
                className={styles.settingItem}
                data-testid="ai-answer-setting"
              >
                <Switch
                  isSelected={settings.aiAnswerExpanded}
                  onChange={value => setSetting('aiAnswerExpanded', value)}
                  label={t('settingsPage.aiAnswerExpanded.label', {})}
                  data-testid="ai-answer-switch"
                />
                <Text
                  as="div"
                  variant="body-small"
                  color="secondary"
                  className={styles.description}
                >
                  {t('settingsPage.aiAnswerExpanded.description', {})}
                </Text>
              </div>
            )}

            <div
              className={styles.settingItem}
              data-testid="pagination-setting"
            >
              <Switch
                isSelected={settings.usePagination}
                onChange={value => setSetting('usePagination', value)}
                label={t('settingsPage.usePagination.label', {})}
                data-testid="pagination-switch"
              />
              <Text
                as="div"
                variant="body-small"
                color="secondary"
                className={styles.description}
              >
                {t('settingsPage.usePagination.description', {})}
              </Text>
            </div>

            <Box className={styles.viewTypeSection}>
              <Text as="h3" variant="title-x-small">
                {t('settingsPage.viewTypePreferences.title', {})}
              </Text>
              <Text
                as="div"
                variant="body-small"
                color="secondary"
                className={styles.description}
              >
                {t('settingsPage.viewTypePreferences.description', {})}
              </Text>

              {viewTypes.map(({ key, label }) => {
                const currentView = getViewType(key) ?? 'default';
                return (
                  <div
                    key={key}
                    className={styles.viewTypeItem}
                    data-testid={`view-type-${key}`}
                  >
                    <Text className={styles.viewTypeLabel}>{label}</Text>
                    <ToggleButtonGroup
                      selectionMode="single"
                      disallowEmptySelection
                      selectedKeys={[currentView]}
                      onSelectionChange={keys => {
                        const selected = Array.from(keys)[0];
                        handleViewTypeChange(
                          key,
                          selected === 'default'
                            ? null
                            : (selected as ViewType),
                        );
                      }}
                    >
                      <ToggleButton
                        id="grid"
                        size="small"
                        data-testid={`view-type-${key}-grid`}
                      >
                        {t('settingsPage.viewTypePreferences.grid', {})}
                      </ToggleButton>
                      <ToggleButton
                        id="list"
                        size="small"
                        data-testid={`view-type-${key}-list`}
                      >
                        {t('settingsPage.viewTypePreferences.list', {})}
                      </ToggleButton>
                      <ToggleButton
                        id="default"
                        size="small"
                        data-testid={`view-type-${key}-default`}
                      >
                        {t('settingsPage.viewTypePreferences.default', {})}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                );
              })}
            </Box>
          </Box>

          <Flex direction="column" className={styles.footer}>
            <Button
              variant="secondary"
              onClick={() => {
                resetSettings();
              }}
              data-testid="reset-all-settings-button"
            >
              {t('settingsPage.resetAllSettings', {})}
            </Button>
            <Text
              as="div"
              variant="body-small"
              color="secondary"
              className={styles.description}
            >
              {t('settingsPage.resetAllSettingsDescription', {})}
            </Text>
          </Flex>
        </Box>
      </CardBody>
    </Card>
  );
};
