import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { IconButton, Tooltip } from '@material-ui/core';
import { Fragment, useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const FavoriteButton = (props: { entity: PostResponse }) => {
  const [entity, setEntity] = useState<PostResponse>(props.entity);
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const alertApi = useApi(alertApiRef);

  const favoriteQuestion = () => {
    qetaApi
      .favoritePost(entity.id)
      .catch(e =>
        alertApi.post({
          message: e.message,
          display: 'transient',
          severity: 'error',
        }),
      )
      .then(response => {
        if (response) {
          setEntity(response);
        }
      });
  };

  const unfavoriteQuestion = () => {
    qetaApi
      .unfavoritePost(entity.id)
      .catch(e =>
        alertApi.post({
          message: e.message,
          display: 'transient',
          severity: 'error',
        }),
      )
      .then(response => {
        if (response) {
          setEntity(response);
        }
      });
  };

  return (
    <Fragment>
      {entity.favorite ? (
        <Tooltip title={t('favorite.remove')}>
          <IconButton
            aria-label="unfavorite"
            size="small"
            disabled={entity.status !== 'active'}
            onClick={unfavoriteQuestion}
            className="qetaUnfavoriteBtn"
          >
            <StarIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={t('favorite.add')}>
          <IconButton
            aria-label="favorite"
            size="small"
            disabled={entity.status !== 'active'}
            onClick={favoriteQuestion}
            className="qetaFavoriteBtn"
          >
            <StarOutlineIcon />
          </IconButton>
        </Tooltip>
      )}
    </Fragment>
  );
};
