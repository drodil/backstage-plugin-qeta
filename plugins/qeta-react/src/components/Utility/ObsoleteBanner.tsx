import { makeStyles, Paper, Typography } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

const useStyles = makeStyles(
  theme => ({
    obsoleteBanner: {
      backgroundColor: theme.palette.warning.main,
      color: theme.palette.warning.contrastText,
      padding: '8px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  }),
  { name: 'QetaObsoleteBanner' },
);

export const ObsoleteBanner = () => {
  const styles = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Paper className={styles.obsoleteBanner} elevation={0}>
      <WarningIcon fontSize="small" />
      <Typography variant="body2">
        {t('questionPage.obsoleteStatus')}
      </Typography>
    </Paper>
  );
};
