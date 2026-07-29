import {
  AskQuestionButton,
  ContentHeader,
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
import { Box, makeStyles } from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import HomeOutlined from '@material-ui/icons/HomeOutlined';

const useStyles = makeStyles(theme => ({
  flexRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    width: '100%',
    marginBottom: theme.spacing(2),
    alignItems: 'stretch',
  },
  suggestionColumn: {
    flex: '3 1 350px',
    display: 'flex',
    minWidth: 0,
    '& > *': {
      flex: 1,
      maxHeight: 460,
      overflowY: 'auto',
    },
  },
  followedColumn: {
    flex: '1 1 250px',
    display: 'flex',
    minWidth: 0,
    '& > *': {
      flex: 1,
      maxHeight: 460,
      overflowY: 'auto',
    },
  },
  equalColumn: {
    flex: '1 1 395px',
    display: 'flex',
    minWidth: 0,
    '& > *': {
      flex: 1,
      maxHeight: 460,
      overflowY: 'auto',
    },
  },
  timelineWrapper: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
}));

export const HomePage = () => {
  const classes = useStyles();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  const showSuggestions =
    !disabled.questions || !disabled.articles || !disabled.links;
  const showFollowed =
    !disabled.tags || !disabled.entities || !disabled.collections;

  return (
    <>
      <ContentHeader
        title={t('homePage.title')}
        titleIcon={<HomeOutlined fontSize="large" />}
      >
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>

      {(showSuggestions || showFollowed) && (
        <Box className={classes.flexRow}>
          {showSuggestions && (
            <Box className={classes.suggestionColumn}>
              <SuggestionsCard />
            </Box>
          )}
          {showFollowed && (
            <Box className={classes.followedColumn}>
              <FollowedItemsCard />
            </Box>
          )}
        </Box>
      )}

      <Box className={classes.flexRow}>
        <Box className={classes.equalColumn}>
          <ImpactCard />
        </Box>
        <Box className={classes.equalColumn}>
          <CommunityActivityCard />
        </Box>
      </Box>

      <Box className={classes.timelineWrapper}>
        <Timeline />
      </Box>
    </>
  );
};
