import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  TopRankingUsers,
  useQetaConfig,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { GlobalStatsContent } from './GlobalStatsContent';
import { Tab, TabList, TabPanel, Tabs } from '@backstage/ui';
import { RiTrophyLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import styles from './StatisticsPage.module.css';

export const StatisticsPage = () => {
  const [tab, setTab] = useState('global');
  const { disabled } = useQetaConfig();

  useEffect(() => {
    if (disabled.questions && tab === 'leaderboard') {
      setTab('global');
    }
  }, [disabled.questions, tab]);

  return (
    <>
      <ContentHeader title="Statistics" titleIcon={<RiTrophyLine size={24} />}>
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <Tabs selectedKey={tab} onSelectionChange={key => setTab(key as string)}>
        <TabList>
          <Tab id="global">Global Stats</Tab>
          {!disabled.questions && <Tab id="leaderboard">Leaderboard</Tab>}
        </TabList>
        <TabPanel id="global" className={styles.tabPanel}>
          <GlobalStatsContent />
        </TabPanel>
        {!disabled.questions && (
          <TabPanel id="leaderboard" className={styles.tabPanel}>
            <TopRankingUsers limit={10} />
          </TabPanel>
        )}
      </Tabs>
    </>
  );
};
