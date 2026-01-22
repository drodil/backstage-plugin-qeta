import { useEffect, useState } from 'react';
import {
  PostsContainer,
  PostsContainerProps,
  QetaProvider,
  ViewType,
} from '@drodil/backstage-plugin-qeta-react';
import { Content } from '@backstage/core-components';
import { isUserEntity, stringifyEntityRef } from '@backstage/catalog-model';
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { Container } from '@material-ui/core';
import { PluggableList } from 'unified';
import { useApi } from '@backstage/core-plugin-api';
import { Skeleton } from '@material-ui/lab';

export type EntityPostsContentProps = PostsContainerProps & {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  /**
   * Relation names of the current entity to show posts too.
   * For example for a system, you can also show all posts from components
   * related to the system by passing `partOf` relation.
   */
  relations?: string[];
};

export const EntityPostsContent = (props: EntityPostsContentProps) => {
  const [view, setView] = useState<ViewType>(props.view ?? 'list');
  const { entity } = useEntity();
  const catalog = useApi(catalogApiRef);
  const [additionalProps, setAdditionalProps] = useState<PostsContainerProps>(
    () => {
      if (isUserEntity(entity)) {
        return { author: stringifyEntityRef(entity) };
      }
      return { entity: props.entity ?? stringifyEntityRef(entity) };
    },
  );

  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!props.relations?.length) {
      setLoading(false);
      return;
    }
    const filters = props.relations.map(relation => {
      return { [`relations.${relation}`]: stringifyEntityRef(entity) };
    });
    catalog
      .getEntities({
        filter: filters,
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
      })
      .then(entities => {
        setAdditionalProps(prev => ({
          ...prev,
          entities: entities.items.map(stringifyEntityRef),
          entitiesRelation: 'or',
        }));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [catalog, entity, props.relations]);

  if (loading) {
    return <Skeleton variant="rect" height={200} />;
  }

  return (
    <QetaProvider
      remarkPlugins={props.remarkPlugins}
      rehypePlugins={props.rehypePlugins}
    >
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
    </QetaProvider>
  );
};
