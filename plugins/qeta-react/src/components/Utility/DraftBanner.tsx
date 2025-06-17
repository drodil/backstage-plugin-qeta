import { Paper, Typography, makeStyles } from '@material-ui/core';
import DraftsIcon from '@material-ui/icons/Drafts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

const useStyles = makeStyles(
  () => ({
    draftBanner: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      padding: '8px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  }),
  { name: 'QetaDraftBanner' },
);

export const DraftBanner = () => {
  const styles = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Paper className={styles.draftBanner} elevation={0}>
      <DraftsIcon fontSize="small" />
      <Typography variant="body2">{t('questionPage.draftStatus')}</Typography>
    </Paper>
  );
};
