import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { Fragment, useState } from 'react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { RiStarFill, RiStarLine } from '@remixicon/react';
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

  const isDisabled = entity.status !== 'active' && entity.status !== 'obsolete';

  return (
    <Fragment>
      {entity.favorite ? (
        <TooltipTrigger>
          <ButtonIcon
            aria-label="unfavorite"
            size="small"
            variant="tertiary"
            isDisabled={isDisabled}
            onPress={unfavoriteQuestion}
            className="qetaUnfavoriteBtn"
            icon={<RiStarFill size={16} />}
          />
          <Tooltip>{t('favorite.remove')}</Tooltip>
        </TooltipTrigger>
      ) : (
        <TooltipTrigger>
          <ButtonIcon
            aria-label="favorite"
            size="small"
            variant="tertiary"
            isDisabled={isDisabled}
            onPress={favoriteQuestion}
            className="qetaFavoriteBtn"
            icon={<RiStarLine size={16} />}
          />
          <Tooltip>{t('favorite.add')}</Tooltip>
        </TooltipTrigger>
      )}
    </Fragment>
  );
};
