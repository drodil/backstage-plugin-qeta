import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { IconButton, Tooltip } from '@material-ui/core';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../utils/hooks';

export const FavoriteButton = (props: { entity: PostResponse }) => {
  const [entity, setEntity] = React.useState<PostResponse>(props.entity);
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();

  const favoriteQuestion = () => {
    qetaApi.favoritePost(entity.id).then(response => {
      setEntity(response);
    });
  };

  const unfavoriteQuestion = () => {
    qetaApi.unfavoritePost(entity.id).then(response => {
      setEntity(response);
    });
  };

  return (
    <React.Fragment>
      {entity.favorite ? (
        <Tooltip title={t('favorite.remove')}>
          <IconButton
            aria-label="unfavorite"
            size="small"
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
            onClick={favoriteQuestion}
            className="qetaFavoriteBtn"
          >
            <StarOutlineIcon />
          </IconButton>
        </Tooltip>
      )}
    </React.Fragment>
  );
};
