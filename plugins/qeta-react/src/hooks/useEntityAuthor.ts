import { UserEntity } from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import DataLoader from 'dataloader';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import React, { useEffect } from 'react';
import {
  AnswerResponse,
  CollectionResponse,
  PostResponse,
  UserResponse,
} from '@drodil/backstage-plugin-qeta-common';

const userCache: Map<string, UserEntity> = new Map();
const dataLoaderFactory = (catalogApi: CatalogApi) =>
  new DataLoader(
    async (entityRefs: readonly string[]) => {
      const { items } = await catalogApi.getEntitiesByRefs({
        fields: [
          'kind',
          'metadata.name',
          'metadata.namespace',
          'spec.profile.displayName',
          'spec.profile.picture',
        ],
        entityRefs: entityRefs as string[],
      });

      entityRefs.forEach((entityRef, index) => {
        userCache.set(entityRef, items[index] as UserEntity);
      });
      return items;
    },
    {
      name: 'EntityAuthorLoader',
      cacheMap: new Map(),
      maxBatchSize: 100,
      batchScheduleFn: callback => {
        setTimeout(callback, 50);
      },
    },
  );

export const useEntityAuthor = (
  entity: PostResponse | AnswerResponse | CollectionResponse | UserResponse,
) => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const [name, setName] = React.useState<string | undefined>(undefined);
  const [user, setUser] = React.useState<UserEntity | null>(null);
  const [initials, setInitials] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<string | null>(null);
  const anonymous = 'anonymous' in entity ? entity.anonymous ?? false : false;
  let author =
    // eslint-disable-next-line no-nested-ternary
    'author' in entity
      ? entity.author
      : 'userRef' in entity
      ? entity.userRef
      : entity.owner;
  if (!author.startsWith('user:')) {
    author = `user:${author}`;
  }

  const { primaryTitle: userName } = useEntityPresentation(author);

  useEffect(() => {
    if (anonymous) {
      return;
    }

    if (userCache.get(author)) {
      setUser(userCache.get(author) as UserEntity);
      return;
    }

    dataLoaderFactory(catalogApi)
      .load(author)
      .then(data => {
        if (data) {
          setUser(data as UserEntity);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [catalogApi, author, anonymous]);

  useEffect(() => {
    identityApi.getBackstageIdentity().then(res => {
      setCurrentUser(res.userEntityRef ?? 'user:default/guest');
    });
  }, [identityApi]);

  useEffect(() => {
    let displayName = userName;
    if (author === currentUser) {
      displayName = 'You';
      if (anonymous) {
        displayName += ' (anonymous)';
      }
    }
    setName(displayName);
  }, [author, anonymous, currentUser, userName]);

  useEffect(() => {
    const init = (name ?? '')
      .split(' ')
      .map(p => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    setInitials(init);
  }, [name]);

  return { name, initials, user };
};
