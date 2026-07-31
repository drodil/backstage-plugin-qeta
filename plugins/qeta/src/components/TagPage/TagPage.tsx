import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  CreateLinkButton,
  DeleteModal,
  EditTagModal,
  PostsContainer,
  qetaApiRef,
  qetaTranslationRef,
  TagFollowButton,
  TagsContainer,
  useIsModerator,
  useQetaConfig,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiGroupLine,
  RiQuestionAnswerLine,
} from '@remixicon/react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Button, Flex, Header, Text } from '@backstage/ui';
import styles from './TagPage.module.css';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [resp, setResp] = useState<undefined | TagResponse>();
  const { isModerator } = useIsModerator();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const qetaApi = useApi(qetaApiRef);
  const alertApi = useApi(alertApiRef);

  const fetchTag = () => {
    if (!tag) {
      setResp(undefined);
      return;
    }

    qetaApi
      .getTag(tag)
      .then(res => {
        if (res) {
          setResp(res);
        }
      })
      .catch(e => {
        alertApi.post({
          message: e.message,
          severity: 'error',
          display: 'transient',
        });
      });
  };

  useEffect(() => {
    fetchTag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qetaApi, tag, alertApi]);

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    fetchTag();
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  if (disabled.tags) {
    return null;
  }

  return (
    <>
      <Header
        title={tag ?? t('tagPage.defaultTitle', {})}
        description={resp?.description}
        metadata={
          resp && [
            {
              label: t('common.postsLabel', {
                count: resp.postsCount,
                itemType: 'post',
              }),
              value: (
                <>
                  <RiQuestionAnswerLine size={16} /> {resp.postsCount}
                </>
              ),
            },
            {
              label: t('common.followersLabel', {
                count: resp.followerCount,
              }),
              value: (
                <>
                  <RiGroupLine size={16} /> {resp.followerCount}
                </>
              ),
            },
          ]
        }
        customActions={
          <>
            {tag && <TagFollowButton tag={tag} />}
            {tag && <AskQuestionButton tags={tag ? [tag] : undefined} />}
            {tag && <WriteArticleButton tags={tag ? [tag] : undefined} />}
            {tag && <CreateLinkButton tags={tag ? [tag] : undefined} />}
            {resp?.canEdit && (
              <Button
                variant="secondary"
                size="small"
                iconStart={<RiEditLine size={16} />}
                onClick={() => setEditModalOpen(true)}
              >
                {t('tagButton.edit')}
              </Button>
            )}
            {resp?.canDelete && (
              <Button
                variant="secondary"
                size="small"
                destructive
                iconStart={<RiDeleteBinLine size={16} />}
                onClick={() => setDeleteModalOpen(true)}
              >
                {t('tagButton.delete')}
              </Button>
            )}
          </>
        }
      />
      {resp?.experts && resp.experts.length > 0 && (
        <Flex className={styles.actions}>
          <Text as="div" variant="body-small" color="secondary">
            {t('common.experts')}
            {': '}
            {resp.experts.map((e, i) => (
              <>
                <EntityRefLink key={e} entityRef={e} />
                {i === resp.experts!.length - 1 ? '' : ','}
              </>
            ))}
          </Text>
        </Flex>
      )}
      {tag && (
        <PostsContainer
          tags={[tag ?? '']}
          filterPanelProps={{ showTagFilter: false }}
          showTypeLabel
          defaultView="list"
          prefix="tag-posts"
        />
      )}
      {!tag && <TagsContainer />}
      {resp && (
        <>
          <EditTagModal
            tag={resp}
            open={editModalOpen}
            onClose={handleEditModalClose}
            isModerator={isModerator}
          />
          <DeleteModal
            open={deleteModalOpen}
            onClose={handleDeleteModalClose}
            entity={resp}
          />
        </>
      )}
    </>
  );
};
