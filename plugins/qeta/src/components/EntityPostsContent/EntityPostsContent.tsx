import { useState } from 'react';
import {
  PostsContainer,
  PostsContainerProps,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { Content } from '@backstage/core-components';
import { isUserEntity, stringifyEntityRef } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';

export const EntityPostsContent = (props: PostsContainerProps) => {
  const [view, setView] = useState<ViewType>('list');
  const { entity } = useEntity();
  const additionalProps: PostsContainerProps = {};
  if (isUserEntity(entity)) {
    additionalProps.author = stringifyEntityRef(entity);
  } else {
    additionalProps.entity = props.entity ?? stringifyEntityRef(entity);
  }

  return (
    <Content>
      <Container>
        <PostsContainer
          {...props}
          {...additionalProps}
          view={view}
          onViewChange={setView}
        />
      </Container>
    </Content>
  );
};
