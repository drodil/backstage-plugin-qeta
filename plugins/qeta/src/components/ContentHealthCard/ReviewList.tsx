import { PostReview } from '@drodil/backstage-plugin-qeta-common';
import { Text } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  qetaTranslationRef,
  UserLink,
  RelativeTimeWithTooltip,
} from '@drodil/backstage-plugin-qeta-react';
import styles from './ReviewList.module.css';

export const ReviewList = ({ reviews }: { reviews: PostReview[] }) => {
  const { t } = useTranslationRef(qetaTranslationRef);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <>
      <Text as="div" variant="body-small" weight="bold">
        {t('contentHealth.reviewHistory', {})}
      </Text>
      <div className={styles.reviewList}>
        {reviews.map(review => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewMeta}>
              <span className={styles.reviewUserLink}>
                <UserLink entityRef={review.reviewer} />
              </span>
              <Text
                as="span"
                variant="body-x-small"
                className={styles.reviewStatus}
                color={review.status === 'valid' ? 'success' : 'danger'}
              >
                {review.status === 'valid'
                  ? t('contentHealth.valid')
                  : t('contentHealth.obsolete')}
              </Text>
              <Text as="span" variant="body-x-small" color="secondary">
                <RelativeTimeWithTooltip value={review.created} />
              </Text>
            </div>
            {review.comment && (
              <Text
                as="div"
                variant="body-small"
                color="secondary"
                className={styles.reviewComment}
              >
                {review.comment}
              </Text>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
