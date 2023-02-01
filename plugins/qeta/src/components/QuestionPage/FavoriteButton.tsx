import { qetaApiRef, QuestionResponse } from '../../api';
import { IconButton, Tooltip } from '@material-ui/core';
import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';

export const FavoriteButton = (props: { entity: QuestionResponse }) => {
  const [entity, setEntity] = React.useState<QuestionResponse>(props.entity);
  const qetaApi = useApi(qetaApiRef);

  const favoriteQuestion = () => {
    qetaApi.favoriteQuestion(entity.id).then(response => {
      setEntity(response);
    });
  };

  const unfavoriteQuestion = () => {
    qetaApi.unfavoriteQuestion(entity.id).then(response => {
      setEntity(response);
    });
  };

  return (
    <React.Fragment>
      {entity.favorite ? (
        <Tooltip title="Remove this question from favorites">
          <IconButton
            aria-label="unfavorite"
            size="small"
            onClick={unfavoriteQuestion}
          >
            <StarIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Mark this question as favorite">
          <IconButton
            aria-label="favorite"
            size="small"
            onClick={favoriteQuestion}
          >
            <StarOutlineIcon />
          </IconButton>
        </Tooltip>
      )}
    </React.Fragment>
  );
};
