import { useState } from 'react';
import { Post } from '@drodil/backstage-plugin-qeta-common';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  ObsoleteModal,
  qetaTranslationRef,
  useCanReview,
  useQetaApi,
  ValidReviewModal,
} from '@drodil/backstage-plugin-qeta-react';
import CheckIcon from '@material-ui/icons/Check';
import BlockIcon from '@material-ui/icons/Block';
import { Alert } from '@material-ui/lab';
import { ReviewList } from './ReviewList';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(2),
  },
  cardHeader: {
    paddingBottom: 0,
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  scoreLabel: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  progressBar: {
    flexGrow: 2,
    height: 10,
    borderRadius: 5,
  },
  actions: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
  obsoleteAlert: {
    marginTop: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
}));

export const ContentHealthCard = ({ post }: { post: Post }) => {
  const classes = useStyles();
  const { canReview, canRead } = useCanReview();
  const { t } = useTranslationRef(qetaTranslationRef);

  const { value: reviews } = useQetaApi(
    api => api.getPostReviews(post.id),
    [post.id],
  );

  const [openObsoleteModal, setOpenObsoleteModal] = useState(false);
  const [openValidModal, setOpenValidModal] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!canRead && !canReview) {
    return null;
  }

  const getProgressColor = (score: number) => {
    if (score > 70) return 'primary';
    if (score > 40) return 'secondary';
    return 'secondary';
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title={t('contentHealth.cardTitle')}
        titleTypographyProps={{ variant: 'h6' }}
        className={classes.cardHeader}
      />
      <CardContent>
        {post.status !== 'obsolete' && post.needsReview && (
          <Typography variant="body2" paragraph>
            {t('contentHealth.description')}
          </Typography>
        )}
        <div className={classes.scoreContainer}>
          <Typography variant="body1" className={classes.scoreLabel}>
            {t('contentHealth.healthScore', {
              score: String(post.healthScore),
            })}
          </Typography>
        </div>
        <LinearProgress
          variant="determinate"
          value={post.healthScore ?? 0}
          className={classes.progressBar}
          color={getProgressColor(post.healthScore ?? 0)}
        />

        {post.status === 'obsolete' && (
          <Alert severity="warning" className={classes.obsoleteAlert}>
            {t('contentHealth.obsoleteWarning')}
          </Alert>
        )}

        {canReview && (post.needsReview || post.status === 'obsolete') && (
          <div className={classes.actions}>
            <Tooltip title={t('contentHealth.markValid')}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<CheckIcon />}
                onClick={() => setOpenValidModal(true)}
              >
                {t('contentHealth.valid')}
              </Button>
            </Tooltip>
            <Tooltip title={t('contentHealth.markObsolete')}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<BlockIcon />}
                onClick={() => setOpenObsoleteModal(true)}
              >
                {t('contentHealth.obsolete')}
              </Button>
            </Tooltip>
          </div>
        )}

        <ObsoleteModal
          open={openObsoleteModal}
          onClose={() => setOpenObsoleteModal(false)}
          post={post}
          onConfirm={handleRefresh}
        />
        <ValidReviewModal
          open={openValidModal}
          onClose={() => setOpenValidModal(false)}
          post={post}
          onConfirm={handleRefresh}
        />

        {reviews && reviews.length > 0 && (
          <>
            <Divider className={classes.divider} />
            <ReviewList reviews={reviews} />
          </>
        )}
      </CardContent>
    </Card>
  );
};
