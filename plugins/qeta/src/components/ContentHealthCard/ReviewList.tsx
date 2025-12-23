import { PostReview } from '@drodil/backstage-plugin-qeta-common';
import {
  Typography,
  makeStyles,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  qetaTranslationRef,
  UserLink,
  RelativeTimeWithTooltip,
} from '@drodil/backstage-plugin-qeta-react';

const useStyles = makeStyles(theme => ({
  reviewList: {
    padding: 0,
    marginTop: theme.spacing(1),
  },
  reviewItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  reviewMeta: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
  },
  reviewUserLink: {
    fontSize: '0.75rem',
  },
  reviewStatus: {
    fontWeight: 500,
  },
  reviewComment: {
    marginTop: theme.spacing(0.25),
    fontSize: '0.8rem',
  },
}));

export const ReviewList = ({ reviews }: { reviews: PostReview[] }) => {
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="subtitle2">
        {t('contentHealth.reviewHistory', {})}
      </Typography>
      <List className={classes.reviewList}>
        {reviews.map(review => (
          <ListItem key={review.id} className={classes.reviewItem} dense>
            <ListItemText
              primary={
                <div className={classes.reviewMeta}>
                  <span className={classes.reviewUserLink}>
                    <UserLink entityRef={review.reviewer} />
                  </span>
                  <Typography
                    variant="caption"
                    className={classes.reviewStatus}
                    color={review.status === 'valid' ? 'primary' : 'secondary'}
                  >
                    {review.status === 'valid'
                      ? t('contentHealth.valid')
                      : t('contentHealth.obsolete')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <RelativeTimeWithTooltip value={review.created} />
                  </Typography>
                </div>
              }
              secondary={
                review.comment ? (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={classes.reviewComment}
                  >
                    {review.comment}
                  </Typography>
                ) : null
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};
