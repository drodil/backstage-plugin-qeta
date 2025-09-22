import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';
import LinkIcon from '@material-ui/icons/Link';
import { useState } from 'react';

export const FaviconItem = (props: { entity: PostResponse }) => {
  const { entity } = props;
  const { url } = entity;
  const qetaApi = useApi(qetaApiRef);
  const [error, setError] = useState(false);

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
      {!error && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
            url ?? '',
          )}&sz=16`}
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
