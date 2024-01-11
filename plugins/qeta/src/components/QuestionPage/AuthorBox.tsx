import { Avatar, Box, Grid, Typography } from '@material-ui/core';
import { formatEntityName } from '../../utils/utils';
import React, { useEffect } from 'react';
import { useStyles } from '../../utils/hooks';
import {
  AnswerResponse,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { UserEntity } from '@backstage/catalog-model';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AuthorLink, UpdatedByLink } from '../Links/Links';

export const AuthorBox = (props: {
  entity: QuestionResponse | AnswerResponse;
}) => {
  const { entity } = props;
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const [user, setUser] = React.useState<UserEntity | null>(null);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const styles = useStyles();
  const anonymous = entity.anonymous ?? false;
  useEffect(() => {
    if (!anonymous) {
      catalogApi
        .getEntityByRef(entity.author)
        .catch(_ => setUser(null))
        .then(data => (data ? setUser(data as UserEntity) : setUser(null)));
    }
  }, [catalogApi, entity, anonymous]);

  useEffect(() => {
    identityApi.getBackstageIdentity().then(res => {
      setCurrentUser(res.userEntityRef ?? 'user:default/guest');
    });
  }, [identityApi]);

  let name = formatEntityName(entity.author);
  if (user && user.metadata.title) {
    name = user.metadata.title;
  }

  if (entity.author === currentUser) {
    name = 'You';
    if (anonymous) {
      name += ' (anonymous)';
    }
  }

  const initials = (name ?? '')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Box className={`qetaAuthorBox ${styles.questionCardAuthor}`}>
      <Grid container alignItems="center">
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <Typography className="qetaAuthorBoxCreated" variant="caption">
            Posted <RelativeTimeWithTooltip value={entity.created} />
          </Typography>
        </Grid>
        {entity.updated && entity.updatedBy && (
          <Grid item xs={12} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Typography className="qetaAuthorBoxUpdated" variant="caption">
              Updated <RelativeTimeWithTooltip value={entity.updated} /> by{' '}
              <UpdatedByLink entity={entity} />
            </Typography>
          </Grid>
        )}
        <Grid item xs={2}>
          <Avatar
            src={user?.spec?.profile?.picture}
            className="qetaAuthorBoxAvatar avatar"
            alt={name}
            variant="rounded"
          >
            {initials}
          </Avatar>
        </Grid>
        <Grid item xs={10} className={styles.authorLink}>
          <Box style={{ paddingLeft: '5px' }}>
            <AuthorLink entity={entity} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
