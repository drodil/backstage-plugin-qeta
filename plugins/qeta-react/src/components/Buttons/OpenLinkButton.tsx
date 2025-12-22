import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { IconButton, Tooltip } from '@material-ui/core';
import OpenLinkIcon from '@material-ui/icons/OpenInNew';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';

export const OpenLinkButton = (props: {
  entity: PostResponse;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { entity, className, style } = props;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);

  if (!entity.url) {
    return null;
  }

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    qetaApi.clickLink(entity.id);
    window.open(entity.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Tooltip title={`${t('link.open')}: ${entity.url}`}>
      <IconButton
        component="a"
        href={entity.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('link.open')}
        size="small"
        onClick={handleClick}
        className={className}
        style={style}
      >
        <OpenLinkIcon />
      </IconButton>
    </Tooltip>
  );
};
