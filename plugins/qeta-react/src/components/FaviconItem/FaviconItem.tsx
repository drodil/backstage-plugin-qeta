import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';
import LinkIcon from '@material-ui/icons/Link';
import { useEffect, useState } from 'react';

export const FaviconItem = (props: { entity: PostResponse }) => {
  const { entity } = props;
  const { url } = entity;
  const qetaApi = useApi(qetaApiRef);
  const [error, setError] = useState(false);
  const [favicon, setFavicon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!url) return;

    qetaApi.fetchURLMetadata({ url }).then(response => {
      if (response.favicon) {
        setError(false);
        setFavicon(response.favicon);
      } else {
        setError(true);
      }
    });
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-block', marginRight: 8 }}
      onClick={event => {
        event.stopPropagation();
        qetaApi.clickLink(entity.id);
      }}
    >
      {!error && favicon && (
        <img
          src={favicon}
          alt={url}
          width={16}
          height={16}
          onError={e => {
            e.currentTarget.style.display = 'none';
            setError(true);
          }}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            objectFit: 'contain',
            marginBottom: 5,
          }}
        />
      )}
      {error && (
        <LinkIcon
          width={16}
          height={16}
          style={{
            display: 'inline-block',
            marginBottom: 5,
            verticalAlign: 'middle',
          }}
        />
      )}
    </a>
  );
};
