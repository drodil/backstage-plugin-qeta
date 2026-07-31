import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { userRouteRef } from '../../routes';
import { useIdentityApi } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import {
  Avatar,
  Box,
  Card,
  Columns,
  Flex,
  Grid,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { UserFollowButton } from '../Buttons/UserFollowButton';
import {
  RiEyeLine,
  RiFileTextLine,
  RiLinkM,
  RiQuestionAnswerLine,
  RiQuestionLine,
  RiStarFill,
  RiThumbUpLine,
} from '@remixicon/react';
import { qetaTranslationRef } from '../../translation.ts';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { ClickableLink } from '../Utility/ClickableLink';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { useQetaConfig } from '../../hooks/useQetaConfig';
import styles from './UsersGridItem.module.css';

export const UsersGridItem = (props: { user: UserResponse }) => {
  const { user } = props;
  const classes = useGridItemStyles();
  const userRoute = useRouteRef(userRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const entityRef = stringifyEntityRef(
    parseEntityRef(user.userRef, { defaultKind: 'user' }),
  );
  const { primaryTitle, Icon } = useEntityPresentation(entityRef);
  const { name, user: userEntity, secondaryTitle } = useEntityAuthor(user);
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);
  const { disabled } = useQetaConfig();

  // Row 1: reputation (always) + questions + articles + links (conditionally)
  const row1Count = [
    true,
    !disabled.questions,
    !disabled.articles,
    !disabled.links,
  ].filter(Boolean).length;
  const row1ColSpan = String(Math.floor(12 / row1Count)) as Columns;

  // Row 2: votes + views (always) + answers (if questions enabled)
  const row2Count = [true, true, !disabled.questions].filter(Boolean).length;
  const row2ColSpan = String(Math.floor(12 / row2Count)) as Columns;

  const href = `${userRoute()}/${user.userRef}`;

  return (
    <Card className={classes.card}>
      <ClickableLink href={href} ariaLabel={primaryTitle}>
        <Flex align="center" className={classes.cardHeader}>
          {Icon && (
            <Avatar
              src={userEntity?.spec?.profile?.picture ?? ''}
              name={name}
              className={styles.avatar}
            />
          )}
          <Box grow minWidth="0">
            <TooltipTrigger>
              <Text variant="title-small" weight="bold" truncate as="div">
                {primaryTitle}
              </Text>
              <Tooltip>{secondaryTitle ?? ''}</Tooltip>
            </TooltipTrigger>
          </Box>
          {!loadingUser &&
            !userError &&
            currentUser?.userEntityRef !== user.userRef && (
              <Box
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <UserFollowButton userRef={user.userRef} />
              </Box>
            )}
        </Flex>
        <div className={`${classes.cardContent} ${styles.flexColumn}`}>
          <Grid.Root
            columns={{ sm: '12' }}
            gap="1"
            className={styles.statsGrid}
          >
            <Grid.Item colSpan={{ sm: row1ColSpan }}>
              <div className={styles.statItem}>
                <RiStarFill size={16} color="var(--bui-fg-warning)" />
                <Text variant="body-small" weight="bold">
                  {user.reputation}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('impactCard.reputation')}
                </Text>
              </div>
            </Grid.Item>
            {!disabled.questions && (
              <Grid.Item colSpan={{ sm: row1ColSpan }}>
                <div className={styles.statItem}>
                  <RiQuestionLine size={16} />
                  <Text variant="body-small" weight="bold">
                    {user.totalQuestions}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('common.questions')}
                  </Text>
                </div>
              </Grid.Item>
            )}
            {!disabled.articles && (
              <Grid.Item colSpan={{ sm: row1ColSpan }}>
                <div className={styles.statItem}>
                  <RiFileTextLine size={16} />
                  <Text variant="body-small" weight="bold">
                    {user.totalArticles}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('common.articles')}
                  </Text>
                </div>
              </Grid.Item>
            )}
            {!disabled.links && (
              <Grid.Item colSpan={{ sm: row1ColSpan }}>
                <div className={styles.statItem}>
                  <RiLinkM size={16} />
                  <Text variant="body-small" weight="bold">
                    {user.totalLinks}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('common.links')}
                  </Text>
                </div>
              </Grid.Item>
            )}
            {!disabled.questions && (
              <Grid.Item colSpan={{ sm: row2ColSpan }}>
                <div className={styles.statItem}>
                  <RiQuestionAnswerLine size={16} />
                  <Text variant="body-small" weight="bold">
                    {user.totalAnswers}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('common.answers')}
                  </Text>
                </div>
              </Grid.Item>
            )}
            <Grid.Item colSpan={{ sm: row2ColSpan }}>
              <div className={styles.statItem}>
                <RiThumbUpLine size={16} />
                <Text variant="body-small" weight="bold">
                  {user.totalVotes}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('common.votes')}
                </Text>
              </div>
            </Grid.Item>
            <Grid.Item colSpan={{ sm: row2ColSpan }}>
              <div className={styles.statItem}>
                <RiEyeLine size={16} />
                <Text variant="body-small" weight="bold">
                  {user.totalViews}
                </Text>
                <Text variant="body-x-small" color="secondary">
                  {t('common.views')}
                </Text>
              </div>
            </Grid.Item>
          </Grid.Root>
        </div>
      </ClickableLink>
    </Card>
  );
};
