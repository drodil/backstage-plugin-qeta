import { IconButton, Tooltip, Box, makeStyles } from '@material-ui/core';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';

const useStyles = makeStyles(theme => ({
  rankingControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(0.5),
  },
  rankingButton: {
    padding: theme.spacing(0.5),
  },
}));

export interface RankingButtonsProps {
  postId: number;
  collectionId: number | undefined;
  onRankUpdate?: () => void;
}

export const RankingButtons = (props: RankingButtonsProps) => {
  const { postId, collectionId, onRankUpdate } = props;
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const qetaApi = useApi(qetaApiRef);

  if (!collectionId) {
    return null;
  }

  const rank = (direction: 'top' | 'bottom' | 'up' | 'down') => {
    qetaApi.rankPostInCollection(collectionId, postId, direction).then(res => {
      if (res) {
        onRankUpdate?.();
      }
    });
  };

  return (
    <Box className={classes.rankingControls}>
      <Tooltip title={t('ranking.top', {})}>
        <IconButton
          size="small"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            rank('top');
          }}
          className={classes.rankingButton}
        >
          <VerticalAlignTopIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('ranking.up', {})}>
        <IconButton
          size="small"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            rank('up');
          }}
          className={classes.rankingButton}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('ranking.down', {})}>
        <IconButton
          size="small"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            rank('down');
          }}
          className={classes.rankingButton}
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('ranking.bottom', {})}>
        <IconButton
          size="small"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            rank('bottom');
          }}
          className={classes.rankingButton}
        >
          <VerticalAlignBottomIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
