import { useState } from 'react';
import { Post } from '@drodil/backstage-plugin-qeta-common';
import {
  Alert,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  ObsoleteModal,
  qetaTranslationRef,
  useCanReview,
  useQetaApi,
  ValidReviewModal,
} from '@drodil/backstage-plugin-qeta-react';
import { RiCheckLine, RiForbidLine } from '@remixicon/react';
import { ReviewList } from './ReviewList';
import styles from './ContentHealthCard.module.css';

export const ContentHealthCard = ({ post }: { post: Post }) => {
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

  const getProgressFillClass = (score: number) => {
    if (score > 70) return styles.progressFillHigh;
    if (score > 40) return styles.progressFillMedium;
    return styles.progressFillLow;
  };

  const healthScore = post.healthScore ?? 0;

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Text as="h3" variant="title-small">
          {t('contentHealth.cardTitle')}
        </Text>
      </CardHeader>
      <CardBody>
        {post.status !== 'obsolete' && post.needsReview && (
          <Text as="div" variant="body-medium">
            {t('contentHealth.description')}
          </Text>
        )}
        <div className={styles.scoreContainer}>
          <Text className={styles.scoreLabel} weight="bold">
            {t('contentHealth.healthScore', {
              score: String(post.healthScore),
            })}
          </Text>
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressFill} ${getProgressFillClass(
                healthScore,
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, healthScore))}%` }}
            />
          </div>
        </div>

        {post.status === 'obsolete' && (
          <Alert
            status="warning"
            icon
            description={t('contentHealth.obsoleteWarning')}
            className={styles.obsoleteAlert}
          />
        )}

        {canReview && (post.needsReview || post.status === 'obsolete') && (
          <Box className={styles.actions}>
            <Flex gap="2">
              <TooltipTrigger>
                <Button
                  variant="secondary"
                  size="small"
                  iconStart={<RiCheckLine size={16} />}
                  onClick={() => setOpenValidModal(true)}
                >
                  {t('contentHealth.valid')}
                </Button>
                <Tooltip>{t('contentHealth.markValid')}</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger>
                <Button
                  variant="secondary"
                  destructive
                  size="small"
                  iconStart={<RiForbidLine size={16} />}
                  onClick={() => setOpenObsoleteModal(true)}
                >
                  {t('contentHealth.obsolete')}
                </Button>
                <Tooltip>{t('contentHealth.markObsolete')}</Tooltip>
              </TooltipTrigger>
            </Flex>
          </Box>
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
            <div className={styles.divider} />
            <ReviewList reviews={reviews} />
          </>
        )}
      </CardBody>
    </Card>
  );
};
