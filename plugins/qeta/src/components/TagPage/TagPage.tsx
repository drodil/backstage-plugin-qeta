import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  ContentHeader,
  CreateLinkButton,
  DeleteModal,
  EditTagModal,
  PostsContainer,
  qetaApiRef,
  qetaTranslationRef,
  TagFollowButton,
  TagsContainer,
  useIsModerator,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import LocalOfferOutlined from '@material-ui/icons/LocalOfferOutlined';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ContentHeaderCard } from '@drodil/backstage-plugin-qeta-react';
import { Button, Typography } from '@material-ui/core';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
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

  return (
    <>
      {tag ? (
        <ContentHeader
          title={tag}
          titleIcon={<LocalOfferOutlined fontSize="large" />}
        >
          <TagFollowButton tag={tag} />
          <AskQuestionButton tags={[tag]} />
          <WriteArticleButton tags={[tag]} />
          <CreateLinkButton tags={[tag]} />
        </ContentHeader>
      ) : (
        <ContentHeader
          title={t('tagPage.defaultTitle', {})}
          titleIcon={<LocalOfferOutlined fontSize="large" />}
        >
          <AskQuestionButton />
          <WriteArticleButton />
          <CreateLinkButton />
        </ContentHeader>
      )}
      {resp && (
        <ContentHeaderCard
          description={resp.description}
          imageIcon={<LocalOfferOutlined style={{ fontSize: 80 }} />}
          stats={[
            {
              label: t('common.postsLabel', {
                count: resp.postsCount,
                itemType: 'post',
              }),
              value: resp.postsCount,
              icon: <QuestionAnswerIcon fontSize="small" />,
            },
            {
              label: t('common.followersLabel', { count: resp.followerCount }),
              value: resp.followerCount,
              icon: <PeopleIcon fontSize="small" />,
            },
          ]}
        >
          {resp.experts && resp.experts.length > 0 && (
            <Typography variant="caption">
              {t('common.experts')}
              {': '}
              {resp.experts.map((e, i) => (
                <>
                  <EntityRefLink key={e} entityRef={e} />
                  {i === resp.experts!.length - 1 ? '' : ','}
                </>
              ))}
            </Typography>
          )}
          {(resp.canEdit || resp.canDelete) && (
            <div style={{ marginTop: '1em' }}>
              {resp.canEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setEditModalOpen(true)}
                  style={{ marginRight: '0.5em' }}
                >
                  {t('tagButton.edit')}
                </Button>
              )}
              {resp.canDelete && (
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  {t('tagButton.delete')}
                </Button>
              )}
            </div>
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
