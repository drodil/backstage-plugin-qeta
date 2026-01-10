import {
  parseEntityRef,
  stringifyEntityRef,
  UserEntity,
} from '@backstage/catalog-model';
import { CatalogApi } from '@backstage/catalog-client';
import DataLoader from 'dataloader';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useEntityPresentation,
} from '@backstage/plugin-catalog-react';
import { useEffect, useState } from 'react';
import {
  AnswerResponse,
  CollectionResponse,
  PostResponse,
  UserResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../translation.ts';

const userCache: Map<string, UserEntity> = new Map();
let userLoader: DataLoader<string, UserEntity | null> | undefined;

const getEntityAuthorLoader = (catalogApi: CatalogApi) => {
  if (userLoader) {
    return userLoader;
  }
  userLoader = new DataLoader<string, UserEntity | null>(
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
        if (items[index]) {
          userCache.set(entityRef, items[index] as UserEntity);
        }
      });
      return items as (UserEntity | null)[];
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
  return userLoader;
};

export const useUserInfo = (entityRef: string, anonymous?: boolean) => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const [name, setName] = useState<string>('');
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const [user, setUser] = useState<UserEntity | null>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const ref = stringifyEntityRef(
    parseEntityRef(entityRef, { defaultKind: 'user' }),
  );

  const {
    primaryTitle: userName,
    secondaryTitle,
    Icon,
  } = useEntityPresentation(ref, { defaultKind: 'user' });

  useEffect(() => {
    if (anonymous) {
      return;
    }

    if (userCache.get(ref)) {
      setUser(userCache.get(ref) as UserEntity);
      return;
    }

    getEntityAuthorLoader(catalogApi)
      .load(ref)
      .then(data => {
        if (data) {
          setUser(data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [catalogApi, ref, anonymous]);

  useEffect(() => {
    identityApi.getBackstageIdentity().then(res => {
      setCurrentUser(res.userEntityRef ?? 'user:default/guest');
    });
  }, [identityApi]);

  useEffect(() => {
    let displayName = userName;
    if (currentUser) {
      const currentUserRef = parseEntityRef(currentUser, {
        defaultKind: 'user',
      });
      const userRef = parseEntityRef(ref, { defaultKind: 'user' });
      if (
        currentUserRef.name === userRef.name &&
        currentUserRef.namespace === userRef.namespace
      ) {
        setIsCurrentUser(true);
        displayName = `${t('userLink.you')}${
          anonymous
            ? ` (${t('userLink.anonymous').toLocaleLowerCase('en-US')})`
            : ''
        }`;
      } else if (anonymous) {
        displayName = t('userLink.anonymous');
      }
    } else if (anonymous) {
      displayName = t('userLink.anonymous');
    }
    setName(displayName);
  }, [ref, anonymous, currentUser, userName, t]);

  useEffect(() => {
    const init = (name ?? '')
      .replace(/[^a-zA-Z]/g, '')
      .split(' ')
      .map(p => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    setInitials(init);
  }, [name]);

  return { name, initials, user, secondaryTitle, Icon, isCurrentUser };
};

export const useEntityAuthor = (
  entity: PostResponse | AnswerResponse | CollectionResponse | UserResponse,
) => {
  const anonymous = 'anonymous' in entity ? entity.anonymous ?? false : false;
  const author =
    // eslint-disable-next-line no-nested-ternary
    'author' in entity
      ? entity.author
      : 'userRef' in entity
      ? entity.userRef
      : entity.owner;
  return useUserInfo(author, anonymous);
};
