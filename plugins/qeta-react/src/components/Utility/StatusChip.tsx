import { Chip, makeStyles } from '@material-ui/core';
import DraftsIcon from '@material-ui/icons/Drafts';
import DeleteIcon from '@material-ui/icons/Delete';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.warning.contrastText,
  },
  statusChip: {
    marginLeft: theme.spacing(1),
    padding: '0.5rem 0.5rem',
    flexShrink: 0,
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    '&.deleted': {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.contrastText,
    },
  },
}));

interface StatusChipProps {
  status?: string;
  className?: string;
}

export const StatusChip = ({ status, className }: StatusChipProps) => {
  const styles = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (status === 'draft') {
    return (
      <Chip
        size="small"
        icon={<DraftsIcon className={styles.icon} />}
        label={t('common.draft')}
        className={`${styles.statusChip} ${className || ''}`}
      />
    );
  }
  if (status === 'deleted') {
    return (
      <Chip
        size="small"
        icon={<DeleteIcon className={styles.icon} />}
        label={t('common.deleted')}
        className={`${styles.statusChip} deleted ${className || ''}`}
      />
    );
  }
  return null;
};
