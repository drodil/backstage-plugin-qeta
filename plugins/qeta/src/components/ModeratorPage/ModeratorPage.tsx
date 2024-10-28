import React, { useState } from 'react';
import {
  useIsModerator,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Tab } from '@material-ui/core';
import { ContentHeader } from '@backstage/core-components';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';

export const ModeratorPage = () => {
  const { isModerator } = useIsModerator();
  const [tab, setTab] = useState('templates');
  const { t } = useTranslation();

  if (!isModerator) {
    return null;
  }

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setTab(newValue);
  };

  return (
    <>
      <ContentHeader title={t('moderatorPage.title')} />
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={handleChange}
            aria-label={t('moderatorPage.tools')}
          >
            <Tab label={t('moderatorPage.templates')} value="templates" />
          </TabList>
        </Box>
        <TabPanel value="statistics">
          <h1>Templates</h1>
        </TabPanel>
      </TabContext>
    </>
  );
};
