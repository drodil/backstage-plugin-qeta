import { PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { qetaApiRef } from '../../api.ts';
import { useApi } from '@backstage/core-plugin-api';

export const FaviconItem = (props: { entity: PostResponse }) => {
  const { entity } = props;
  const { url } = entity;
  const qetaApi = useApi(qetaApiRef);

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
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          url ?? '',
        )}&sz=16`}
        alt={url}
        width={16}
        height={16}
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          objectFit: 'contain',
          marginBottom: 5,
        }}
      />
    </a>
  );
};
