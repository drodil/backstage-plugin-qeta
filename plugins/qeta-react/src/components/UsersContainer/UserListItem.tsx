import { UserResponse } from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import { useIdentityApi } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import {
  Avatar,
  Box,
  List,
  ListRow,
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
import { qetaTranslationRef } from '../../translation';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Link } from 'react-router-dom';

import { useQetaConfig } from '../../hooks/useQetaConfig';
import styles from './UserListItem.module.css';

export const UserListItem = (props: { user: UserResponse }) => {
  const { user } = props;
  const { disabled } = useQetaConfig();
  const userRoute = useRouteRef(userRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { name, user: userEntity, secondaryTitle } = useEntityAuthor(user);
  const {
    value: currentUser,
    loading: loadingUser,
    error: userError,
  } = useIdentityApi(api => api.getBackstageIdentity(), []);

  const href = `${userRoute()}/${user.userRef}`;

  return (
    <Link to={href} className={styles.link}>
      <List>
        <ListRow
          icon={
            <Avatar
              src={userEntity?.spec?.profile?.picture ?? ''}
              name={name}
            />
          }
          customActions={
            <Box
              className={styles.rowActions}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className={styles.statsWrapper}>
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiStarFill size={16} color="var(--bui-fg-warning)" />
                    <Text variant="body-small">{user.reputation}</Text>
                  </div>
                  <Tooltip>{t('impactCard.reputation')}</Tooltip>
                </TooltipTrigger>
                {!disabled.questions && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiQuestionLine size={16} />
                      <Text variant="body-small">{user.totalQuestions}</Text>
                    </div>
                    <Tooltip>{t('common.questions')}</Tooltip>
                  </TooltipTrigger>
                )}
                {!disabled.questions && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiQuestionAnswerLine size={16} />
                      <Text variant="body-small">{user.totalAnswers}</Text>
                    </div>
                    <Tooltip>{t('common.answers')}</Tooltip>
                  </TooltipTrigger>
                )}
                {!disabled.articles && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiFileTextLine size={16} />
                      <Text variant="body-small">{user.totalArticles}</Text>
                    </div>
                    <Tooltip>{t('common.articles')}</Tooltip>
                  </TooltipTrigger>
                )}
                {!disabled.links && (
                  <TooltipTrigger>
                    <div className={styles.statItem}>
                      <RiLinkM size={16} />
                      <Text variant="body-small">{user.totalLinks}</Text>
                    </div>
                    <Tooltip>{t('common.links')}</Tooltip>
                  </TooltipTrigger>
                )}
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiThumbUpLine size={16} />
                    <Text variant="body-small">{user.totalVotes}</Text>
                  </div>
                  <Tooltip>{t('common.votes')}</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <div className={styles.statItem}>
                    <RiEyeLine size={16} />
                    <Text variant="body-small">{user.totalViews}</Text>
                  </div>
                  <Tooltip>{t('common.views')}</Tooltip>
                </TooltipTrigger>
              </div>
              {!loadingUser &&
                !userError &&
                currentUser?.userEntityRef !== user.userRef && (
                  <UserFollowButton userRef={user.userRef} />
                )}
            </Box>
          }
        >
          <TooltipTrigger>
            <Text
              as="span"
              weight="bold"
              truncate
              className={styles.titleWrapper}
            >
              {name}
            </Text>
            <Tooltip placement="top">{secondaryTitle ?? ''}</Tooltip>
          </TooltipTrigger>
        </ListRow>
      </List>
    </Link>
  );
};
