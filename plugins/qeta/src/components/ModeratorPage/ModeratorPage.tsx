import { useState } from 'react';
import {
  ContentHeader,
  PostsContainer,
  qetaTranslationRef,
  TemplateList,
  useIsModerator,
} from '@drodil/backstage-plugin-qeta-react';
import { Alert, Tab, TabList, TabPanel, Tabs } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { RiSettingsLine } from '@remixicon/react';
import styles from './ModeratorPage.module.css';

export const ModeratorPage = () => {
  const { isModerator } = useIsModerator();
  const [tab, setTab] = useState('templates');
  const { t } = useTranslationRef(qetaTranslationRef);

  if (!isModerator) {
    return null;
  }

  return (
    <>
      <ContentHeader
        title={t('moderatorPage.title')}
        titleIcon={<RiSettingsLine size={28} />}
      />
      <Tabs selectedKey={tab} onSelectionChange={key => setTab(key as string)}>
        <TabList aria-label={t('moderatorPage.tools')}>
          <Tab id="templates">{t('moderatorPage.templates')}</Tab>
          <Tab id="deletedPosts">{t('moderatorPage.deletedPosts')}</Tab>
        </TabList>
        <TabPanel id="templates" className={styles.tabPanel}>
          <Alert
            status="info"
            description={t('moderatorPage.templatesInfo')}
            className={styles.alert}
          />
          <TemplateList />
        </TabPanel>
        <TabPanel id="deletedPosts" className={styles.tabPanel}>
          <PostsContainer
            status="deleted"
            showNoQuestionsBtn={false}
            showTypeLabel
          />
        </TabPanel>
      </Tabs>
    </>
  );
};
