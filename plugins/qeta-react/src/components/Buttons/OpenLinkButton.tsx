import { PostResponse} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { IconButton, Tooltip } from '@material-ui/core';
import OpenLinkIcon from '@material-ui/icons/OpenInNew';

export const OpenLinkButton = (props: { entity: PostResponse; }) => {
  const { entity } = props;
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <Tooltip title={t("link.open")}>
      <IconButton
        component="a"
        href={entity.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("link.open")}
        size="small"
      >
        <OpenLinkIcon />
      </IconButton>
    </Tooltip>
  );
};
