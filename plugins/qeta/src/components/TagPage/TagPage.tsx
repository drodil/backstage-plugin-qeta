import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  CreateLinkButton,
  DeleteButton,
  DeleteModal,
  EditTagModal,
  PostsContainer,
  qetaApiRef,
  qetaTranslationRef,
  TagFollowButton,
  TagsContainer,
  useIsModerator,
  useQetaConfig,
  UserLink,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { RiEditLine } from '@remixicon/react';
import { useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  ButtonIcon,
  Header,
  HeaderMetadataItem,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { toastApiRef } from '@backstage/frontend-plugin-api';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();
  const [resp, setResp] = useState<undefined | TagResponse>();
  const { isModerator } = useIsModerator();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const qetaApi = useApi(qetaApiRef);
  const toastApi = useApi(toastApiRef);

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
        toastApi.post({
          title: e.message,
          status: 'warning',
        });
      });
  };

  useEffect(() => {
    fetchTag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qetaApi, tag, toastApi]);

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

  const getMetadata = (r?: TagResponse): HeaderMetadataItem[] => {
    if (!r) {
      return [];
    }
    const metadata: HeaderMetadataItem[] = [
      {
        label: t('metadata.posts'),
        value: r.postsCount,
      },
      {
        label: t('metadata.followers'),
        value: r.followerCount,
      },
    ];
    if (r?.experts && r.experts.length > 0) {
      metadata.push({
        label: t('common.experts'),
        value: (
          <>
            {r.experts.map((e, i) => (
              <>
                <UserLink key={e} entityRef={e} />
                {i === r.experts!.length - 1 ? '' : ','}
              </>
            ))}
          </>
        ),
      });
    }
    return metadata;
  };

  return (
    <>
      <Header
        title={tag ?? t('tagPage.defaultTitle', {})}
        description={resp?.description}
        metadata={getMetadata(resp)}
        customActions={
          <>
            {resp?.canEdit && (
              <TooltipTrigger>
                <ButtonIcon
                  icon={<RiEditLine size={16} />}
                  variant="secondary"
                  aria-label={t('common.edit')}
                  onClick={() => setEditModalOpen(true)}
                />
                <Tooltip>{t('common.edit')}</Tooltip>
              </TooltipTrigger>
            )}
            {resp && <DeleteButton entity={resp} compact />}
            {tag && <TagFollowButton tag={tag} />}
            {tag && <AskQuestionButton tags={tag ? [tag] : undefined} />}
            {tag && <WriteArticleButton tags={tag ? [tag] : undefined} />}
            {tag && <CreateLinkButton tags={tag ? [tag] : undefined} />}
          </>
        }
      />
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
