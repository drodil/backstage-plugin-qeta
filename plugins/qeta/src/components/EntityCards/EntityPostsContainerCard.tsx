import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  PostsContainer,
  PostsContainerProps,
} from '@drodil/backstage-plugin-qeta-react';
import { InfoCard } from '@backstage/core-components';

export const EntityPostsContainerCard = (props: PostsContainerProps) => {
  const { entity } = useEntity();

  return (
    <InfoCard>
      <PostsContainer {...props} entity={stringifyEntityRef(entity)} />
    </InfoCard>
  );
};
