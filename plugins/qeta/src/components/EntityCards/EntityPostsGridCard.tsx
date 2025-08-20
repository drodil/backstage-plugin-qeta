import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { PostGridProps, PostsGrid } from '@drodil/backstage-plugin-qeta-react';
import { InfoCard } from '@backstage/core-components';

export const EntityPostsGridCard = (props: PostGridProps) => {
  const { entity } = useEntity();

  return (
    <InfoCard>
      <PostsGrid {...props} entity={stringifyEntityRef(entity)} />
    </InfoCard>
  );
};
