import { ChangeEvent, useState } from 'react';
import {
  qetaTranslationRef,
  TemplateList,
  useIsModerator,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Tab } from '@material-ui/core';
import { ContentHeader } from '@backstage/core-components';
import { Alert, TabContext, TabList, TabPanel } from '@material-ui/lab';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const ModeratorPage = () => {
  const { isModerator } = useIsModerator();
  const [tab, setTab] = useState('templates');
  const { t } = useTranslationRef(qetaTranslationRef);

  if (!isModerator) {
    return null;
  }

  const handleChange = (_event: ChangeEvent<{}>, newValue: string) => {
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
