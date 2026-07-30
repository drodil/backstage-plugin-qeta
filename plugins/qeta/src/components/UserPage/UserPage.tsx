import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  AnswersContainer,
  AskQuestionButton,
  CollectionsContainer,
  ContentHeader,
  CreateLinkButton,
  PostsContainer,
  qetaTranslationRef,
  useIdentityApi,
  UserFollowButton,
  useUserInfo,
  WriteArticleButton,
  useQetaApi,
  RelativeTimeWithTooltip,
  useQetaConfig,
} from '@drodil/backstage-plugin-qeta-react';
import { UserStatsContent } from './UserStatsContent';
import {
  Avatar,
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  RiBarChartLine,
  RiBookmarkLine,
  RiLink,
  RiQuestionAnswerLine,
  RiQuestionLine,
  RiStackLine,
} from '@remixicon/react';
import styles from './UserPage.module.css';

export const UserPage = () => {
  const identity = useParams()['*'] ?? 'unknown';
  const { name, user, secondaryTitle } = useUserInfo(identity);
  const [tab, setTab] = useState('statistics');
  const { t } = useTranslationRef(qetaTranslationRef);
  const [_searchParams, setSearchParams] = useSearchParams();
  const { disabled } = useQetaConfig();
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);
  const { value: userStats, loading: loadingUserStats } = useQetaApi(
    api => api.getUserStats(identity),
    [identity],
  );

  const handleChange = (newValue: string) => {
    setSearchParams({});
    setTab(newValue);
  };

  const availableTabs = useMemo(() => {
    return [
      'statistics',
      !disabled.questions ? 'questions' : null,
      !disabled.articles ? 'articles' : null,
      !disabled.links ? 'links' : null,
      !disabled.collections ? 'collections' : null,
      !disabled.questions ? 'answers' : null,
    ].filter((v): v is string => Boolean(v));
  }, [disabled]);

  useEffect(() => {
    if (!availableTabs.includes(tab)) {
      setTab(availableTabs[0]);
    }
  }, [availableTabs, tab]);

  const TabLabel = ({ icon, label }: { icon: ReactNode; label: string }) => (
    <Flex align="center" gap="2" className={styles.tabLabel}>
      {icon}
      <span>{label}</span>
    </Flex>
  );

  const title = (
    <Box
      className={styles.headerContent}
      role="banner"
      aria-label={t('userPage.profileHeader', {})}
    >
      <Avatar
        src={user?.spec?.profile?.picture ?? ''}
        name={name}
        size="x-large"
        className={styles.avatar}
        aria-label={t('userPage.profilePicture', { name })}
      />
      <Flex direction="column" justify="center">
        <Box className={styles.nameRow}>
          <Text as="h1" id="user-name" variant="title-large" weight="bold">
            {name}
          </Text>
        </Box>
        {(secondaryTitle || user?.spec?.profile?.email) && (
          <Text as="div" variant="title-small" color="secondary">
            {secondaryTitle || user?.spec?.profile?.email}
          </Text>
        )}
        {userStats?.summary?.lastSeen && (
          <Text as="div" variant="body-small" color="secondary">
            {t('stats.lastSeen')}:{' '}
            <RelativeTimeWithTooltip value={userStats.summary.lastSeen} />
          </Text>
        )}
      </Flex>
    </Box>
  );

  const tabItems = [
    <Tab key="statistics" id="statistics">
      <TabLabel
        icon={<RiBarChartLine size={16} />}
        label={t('userPage.statistics', {})}
      />
    </Tab>,
    !disabled.questions ? (
      <Tab key="questions" id="questions">
        <TabLabel
          icon={<RiQuestionLine size={16} />}
          label={t('userPage.questions', {})}
        />
      </Tab>
    ) : null,
    !disabled.articles ? (
      <Tab key="articles" id="articles">
        <TabLabel
          icon={<RiBookmarkLine size={16} />}
          label={t('userPage.articles', {})}
        />
      </Tab>
    ) : null,
    !disabled.links ? (
      <Tab key="links" id="links">
        <TabLabel icon={<RiLink size={16} />} label={t('userPage.links', {})} />
      </Tab>
    ) : null,
    !disabled.collections ? (
      <Tab key="collections" id="collections">
        <TabLabel
          icon={<RiStackLine size={16} />}
          label={t('userPage.collections', {})}
        />
      </Tab>
    ) : null,
    !disabled.questions ? (
      <Tab key="answers" id="answers">
        <TabLabel
          icon={<RiQuestionAnswerLine size={16} />}
          label={t('userPage.answers', {})}
        />
      </Tab>
    ) : null,
  ].filter((item): item is ReactElement => item !== null);

  return (
    <>
      <ContentHeader titleComponent={title}>
        {!loadingUser &&
          !userError &&
          currentUser?.userEntityRef !== identity && (
            <UserFollowButton
              userRef={identity}
              aria-label={t('userPage.followUser', { name })}
            />
          )}
        <AskQuestionButton />
        <WriteArticleButton />
        <CreateLinkButton />
      </ContentHeader>
      <Tabs
        selectedKey={tab}
        onSelectionChange={key => handleChange(key as string)}
      >
        <TabList aria-label={t('userPage.profileTab', {})}>{tabItems}</TabList>
        <TabPanel id="statistics" className={styles.tabPanel}>
          <UserStatsContent
            userRef={identity ?? ''}
            stats={userStats}
            loading={loadingUserStats}
          />
        </TabPanel>
        {!disabled.questions && (
          <TabPanel id="questions" className={styles.tabPanel}>
            <PostsContainer
              author={identity ?? ''}
              showNoQuestionsBtn={false}
              type="question"
              prefix="user-questions"
            />
          </TabPanel>
        )}
        {!disabled.articles && (
          <TabPanel id="articles" className={styles.tabPanel}>
            <PostsContainer
              author={identity ?? ''}
              type="article"
              showNoQuestionsBtn={false}
              prefix="user-articles"
            />
          </TabPanel>
        )}
        {!disabled.links && (
          <TabPanel id="links" className={styles.tabPanel}>
            <PostsContainer
              author={identity ?? ''}
              type="link"
              showNoQuestionsBtn={false}
              prefix="user-links"
            />
          </TabPanel>
        )}
        {!disabled.collections && (
          <TabPanel id="collections" className={styles.tabPanel}>
            <CollectionsContainer
              owner={identity ?? ''}
              prefix="user-collections"
            />
          </TabPanel>
        )}
        {!disabled.questions && (
          <TabPanel id="answers" className={styles.tabPanel}>
            <AnswersContainer
              author={identity ?? ''}
              title={t('userPage.answers', {})}
              prefix="user-answers"
            />
          </TabPanel>
        )}
      </Tabs>
    </>
  );
};
