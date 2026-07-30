import { Collection, PostResponse } from '@drodil/backstage-plugin-qeta-common';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
} from '@backstage/ui';
import {
  RiAddCircleLine,
  RiIndeterminateCircleLine,
  RiPlayListAddLine,
} from '@remixicon/react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useQetaApi } from '../../hooks';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { ContentHeaderButton } from './ContentHeaderButton';

export const AddToCollectionButton = (props: { post: PostResponse }) => {
  const { post } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const alertApi = useApi(alertApiRef);
  const { value: response, retry } = useQetaApi(api => {
    return api.getCollections({
      checkAccess: true,
      includeExperts: false,
      includePosts: true,
    });
  }, []);
  const [open, setOpen] = useState(false);
  const qetaApi = useApi(qetaApiRef);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClick = (collection: Collection) => {
    if (collection.posts?.find(p => p.id === post.id)) {
      qetaApi
        .removePostFromCollection(collection.id, post.id)
        .then(() => {
          alertApi.post({
            message: t('addToCollectionButton.removed', {
              collection: collection.title,
            }),
            severity: 'success',
            display: 'transient',
          });
          retry();
        })
        .catch(e => {
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          });
        });
    } else {
      qetaApi
        .addPostToCollection(collection.id, post.id)
        .then(() => {
          alertApi.post({
            message: t('addToCollectionButton.added', {
              collection: collection.title,
            }),
            severity: 'success',
            display: 'transient',
          });
          retry();
        })
        .catch(e => {
          alertApi.post({
            message: e.message,
            severity: 'error',
            display: 'transient',
          });
        });
    }
  };

  if (post.status !== 'active') {
    return null;
  }

  const collections = (response?.collections ?? []).filter(c => c.canEdit);
  if (!collections.length) {
    return null;
  }

  return (
    <>
      <ContentHeaderButton
        onClick={handleClickOpen}
        icon={<RiPlayListAddLine />}
      >
        {t('addToCollectionButton.title')}
      </ContentHeaderButton>
      <Dialog isOpen={open} onOpenChange={setOpen}>
        <DialogHeader>{t('addToCollectionButton.manage')}</DialogHeader>
        <DialogBody>
          <Flex gap="2" style={{ flexWrap: 'wrap' }}>
            {collections.map(collection => {
              const isInCollection = collection.posts?.find(
                p => p.id === post.id,
              );

              return (
                <Button
                  key={collection.id}
                  variant="secondary"
                  iconStart={
                    isInCollection ? (
                      <RiIndeterminateCircleLine />
                    ) : (
                      <RiAddCircleLine />
                    )
                  }
                  onClick={() => handleClick(collection)}
                >
                  {collection.title}
                </Button>
              );
            })}
          </Flex>
        </DialogBody>
        <DialogFooter>
          <Button variant="tertiary" slot="close">
            {t('addToCollectionButton.close')}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
