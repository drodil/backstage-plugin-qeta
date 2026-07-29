import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  TopRankingUsers,
  useQetaConfig,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { GlobalStatsContent } from './GlobalStatsContent';
import { Box, Tab } from '@material-ui/core';
import EmojiEventsOutlined from '@material-ui/icons/EmojiEventsOutlined';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import { useEffect, useState } from 'react';

export const StatisticsPage = () => {
  const [tab, setTab] = useState('global');
  const { disabled } = useQetaConfig();

  useEffect(() => {
    if (disabled.questions && tab === 'leaderboard') {
      setTab('global');
    }
  }, [disabled.questions, tab]);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTab(newValue);
  };

  return (
    <>
      <ContentHeader
        title="Statistics"
        titleIcon={<EmojiEventsOutlined fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} style={{ padding: 0 }}>
            <Tab label="Global Stats" value="global" />
            {!disabled.questions && (
              <Tab label="Leaderboard" value="leaderboard" />
            )}
          </TabList>
        </Box>
        <TabPanel value="global" style={{ padding: '24px 0' }}>
          <GlobalStatsContent />
        </TabPanel>
        {!disabled.questions && (
          <TabPanel value="leaderboard" style={{ padding: '24px 0' }}>
            <TopRankingUsers limit={10} />
          </TabPanel>
        )}
      </TabContext>
    </>
  );
};
