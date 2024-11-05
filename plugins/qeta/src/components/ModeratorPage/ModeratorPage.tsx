import React, { useState } from 'react';
import {
  TemplateList,
  useIsModerator,
  useTranslation,
} from '@drodil/backstage-plugin-qeta-react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { ContentHeader } from '@backstage/core-components';
import Alert from '@mui/material/Alert';
import { TabContext, TabList, TabPanel } from '@mui/lab';

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
        <TabPanel value="templates">
          <Alert severity="info">{t('moderatorPage.templatesInfo')}</Alert>
          <TemplateList />
        </TabPanel>
      </TabContext>
    </>
  );
};
