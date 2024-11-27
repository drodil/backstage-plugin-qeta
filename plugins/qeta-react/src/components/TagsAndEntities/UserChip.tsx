import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import {
  useIdentityApi,
  useTranslation,
  useUserFollow,
  useUserInfo,
} from '../../hooks';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import React from 'react';
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

export const UserTooltip = (props: { entityRef: string }) => {
  const { entityRef } = props;
  const { t } = useTranslation();
  const { name, initials, user, secondaryTitle } = useUserInfo(
    entityRef,
    entityRef === 'anonymous',
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
          <Box style={{ display: 'inline-block', marginRight: '1em' }}>
            <Avatar
              src={user?.spec?.profile?.picture}
              alt={name}
              variant="rounded"
              style={{ width: '1em', height: '1em' }}
            >
              {initials}
            </Avatar>
          </Box>
          <Typography variant="h6" style={{ display: 'inline' }}>
            {name}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
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
  const { t } = useTranslation();
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
