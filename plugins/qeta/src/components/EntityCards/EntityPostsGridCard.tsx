import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  PostsContainer,
  PostsContainerProps,
} from '@drodil/backstage-plugin-qeta-react';
import { Card, CardBody } from '@backstage/ui';

export const EntityPostsGridCard = (props: PostsContainerProps) => {
  const { entity } = useEntity();

  return (
    <Card>
      <CardBody>
        <PostsContainer
          defaultView="grid"
          {...props}
          entity={stringifyEntityRef(entity)}
        />
      </CardBody>
    </Card>
  );
};
