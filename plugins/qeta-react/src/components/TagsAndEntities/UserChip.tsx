import { useRouteRef } from '@backstage/core-plugin-api';
import { userRouteRef } from '../../routes';
import { useTranslation, useUserFollow } from '../../hooks';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import React from 'react';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

export const UserTooltip = (props: { entityRef: string }) => {
  const { entityRef } = props;
  const { t } = useTranslation();
  const {
    primaryTitle: userName,
    Icon,
    secondaryTitle,
  } = useEntityPresentation(
    entityRef.startsWith('user:') ? entityRef : `user:${entityRef}`,
  );
  const users = useUserFollow();

  return (
    <Grid container style={{ padding: '0.5em' }} spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h6">
          {Icon ? <Icon fontSize="small" /> : null}
          {entityRef === 'anonymous' ? t('userLink.anonymous') : userName}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2">{secondaryTitle}</Typography>
      </Grid>
      {!users.loading && (
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
