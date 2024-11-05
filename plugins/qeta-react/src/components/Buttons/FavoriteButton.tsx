import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';

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
