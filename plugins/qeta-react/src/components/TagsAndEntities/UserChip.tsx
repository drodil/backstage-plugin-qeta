import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import { useIdentityApi, useUserFollow, useUserInfo } from '../../hooks';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from '@material-ui/core';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const UserTooltip = (props: {
  entityRef: string;
  anonymous?: boolean;
}) => {
  const { entityRef, anonymous } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { name, initials, user, secondaryTitle } = useUserInfo(
    entityRef,
    anonymous ?? entityRef === 'anonymous',
  );

  const { value: currentUser } = useIdentityApi(
    api => api.getBackstageIdentity(),
    [],
  );
  const users = useUserFollow();

  return (
    <Grid container style={{ padding: '0.5em' }} spacing={1}>
      <Grid item xs={12}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Box style={{ display: 'inline-block', marginRight: '0.5em' }}>
            <Avatar
              src={user?.spec?.profile?.picture}
              alt={name}
              variant="rounded"
              style={{ width: '20px', height: '20px' }}
            >
              {initials}
            </Avatar>
          </Box>
          <Typography
            variant="subtitle1"
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Typography>
        </Box>
        <Typography variant="subtitle2">{secondaryTitle}</Typography>
      </Grid>
      {!users.loading && currentUser?.userEntityRef !== entityRef && (
        <Grid item xs={12}>
          <Button
            size="small"
            variant="outlined"
            color={users.isFollowingUser(entityRef) ? 'secondary' : 'primary'}
            onClick={() => {
              if (users.isFollowingUser(entityRef)) {
                users.unfollowUser(entityRef);
              } else {
                users.followUser(entityRef);
              }
            }}
            startIcon={
              users.isFollowingUser(entityRef) ? (
                <VisibilityOff />
              ) : (
                <Visibility />
              )
            }
          >
            {users.isFollowingUser(entityRef)
              ? t('userButton.unfollow')
              : t('userButton.follow')}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export const UserChip = (props: { entityRef: string }) => {
  const navigate = useNavigate();
  const { entityRef } = props;
  const userRoute = useRouteRef(userRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const { primaryTitle: userName } = useEntityPresentation(
    entityRef.startsWith('user:') ? entityRef : `user:${entityRef}`,
  );
  if (entityRef === 'anonymous') {
    return <>{t('userLink.anonymous')}</>;
  }
  return (
    <Tooltip
      arrow
      title={<UserTooltip entityRef={entityRef} />}
      enterDelay={400}
      interactive
    >
      <Chip
        label={userName}
        size="small"
        className="qetaTagChip"
        component="a"
        onClick={() => {
          navigate(`${userRoute()}/${entityRef}`);
        }}
        clickable
      />
    </Tooltip>
  );
};
