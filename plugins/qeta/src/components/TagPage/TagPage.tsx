import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  ContentHeader,
  ContentHeaderCard,
  CreateLinkButton,
  DeleteModal,
  EditTagModal,
  PostsContainer,
  qetaApiRef,
  qetaTranslationRef,
  TagFollowButton,
  TagsContainer,
  useQetaConfig,
  useIsModerator,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiGroupLine,
  RiPriceTag3Line,
  RiQuestionAnswerLine,
} from '@remixicon/react';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { Button, Flex, Text } from '@backstage/ui';
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
      {tag ? (
        <ContentHeader title={tag} titleIcon={<RiPriceTag3Line size={24} />}>
          <TagFollowButton tag={tag} />
          <AskQuestionButton tags={[tag]} />
          <WriteArticleButton tags={[tag]} />
          <CreateLinkButton tags={[tag]} />
        </ContentHeader>
      ) : (
        <ContentHeader
          title={t('tagPage.defaultTitle', {})}
          titleIcon={<RiPriceTag3Line size={24} />}
        >
          <AskQuestionButton />
          <WriteArticleButton />
          <CreateLinkButton />
        </ContentHeader>
      )}
      {resp && (
        <ContentHeaderCard
          description={resp.description}
          imageIcon={<RiPriceTag3Line size={80} />}
          stats={[
            {
              label: t('common.postsLabel', {
                count: resp.postsCount,
                itemType: 'post',
              }),
              value: resp.postsCount,
              icon: <RiQuestionAnswerLine size={16} />,
            },
            {
              label: t('common.followersLabel', { count: resp.followerCount }),
              value: resp.followerCount,
              icon: <RiGroupLine size={16} />,
            },
          ]}
        >
          {resp.experts && resp.experts.length > 0 && (
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
          )}
          {(resp.canEdit || resp.canDelete) && (
            <Flex align="center" gap="2" className={styles.actions}>
              {resp.canEdit && (
                <Button
                  variant="secondary"
                  size="small"
                  iconStart={<RiEditLine size={16} />}
                  onClick={() => setEditModalOpen(true)}
                >
                  {t('tagButton.edit')}
                </Button>
              )}
              {resp.canDelete && (
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
            </Flex>
          )}
        </ContentHeaderCard>
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
