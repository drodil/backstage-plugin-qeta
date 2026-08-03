import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';
import { RiLinkM } from '@remixicon/react';
import { useState } from 'react';
import { useFavicon } from '../../hooks';

export const FaviconItem = (props: { entity: PostResponse }) => {
  const { entity } = props;
  const { url } = entity;
  const qetaApi = useApi(qetaApiRef);
  const [error, setError] = useState(false);

  const favicon = useFavicon(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-block', marginRight: 4 }}
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
            objectFit: 'contain',
          }}
        />
      )}
      {error || (!favicon && <RiLinkM size={16} />)}
    </a>
  );
};
