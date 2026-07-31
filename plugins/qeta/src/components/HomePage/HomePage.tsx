import {
  AskQuestionButton,
  CreateLinkButton,
  ImpactCard,
  qetaTranslationRef,
  SuggestionsCard,
  WriteArticleButton,
  Timeline,
  CommunityActivityCard,
  FollowedItemsCard,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { Box, Header } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  const showSuggestions =
    !disabled.questions || !disabled.articles || !disabled.links;
  const showFollowed =
    !disabled.tags || !disabled.entities || !disabled.collections;

  return (
    <>
      <Header
        title={t('homePage.title')}
        customActions={
          <>
            <AskQuestionButton />
            <WriteArticleButton />
            <CreateLinkButton />
          </>
        }
      />

      {(showSuggestions || showFollowed) && (
        <Box className={styles.flexRow}>
          {showSuggestions && (
            <Box className={styles.suggestionColumn}>
              <SuggestionsCard />
            </Box>
          )}
          {showFollowed && (
            <Box className={styles.followedColumn}>
              <FollowedItemsCard />
            </Box>
          )}
        </Box>
      )}

      <Box className={styles.flexRow}>
        <Box className={styles.equalColumn}>
          <ImpactCard />
        </Box>
        <Box className={styles.equalColumn}>
          <CommunityActivityCard />
        </Box>
      </Box>

      <Box className={styles.timelineWrapper}>
        <Timeline />
      </Box>
    </>
  );
};
