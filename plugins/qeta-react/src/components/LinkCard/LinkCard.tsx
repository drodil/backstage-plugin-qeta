import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useState } from 'react';
import { DeleteModal } from '../Modals';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiArrowGoBackLine,
} from '@remixicon/react';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { alertApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { LinkButton } from '../Buttons/LinkButton';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { editLinkRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Button, Card, CardBody, Flex } from '@backstage/ui';
import { useIsModerator } from '../../hooks';
import { AuthorBoxes } from '../AuthorBox/AuthorBoxes.tsx';
import { OpenLinkButton } from '../Buttons/OpenLinkButton.tsx';
import { qetaApiRef } from '../../api.ts';
import styles from './LinkCard.module.css';

export const LinkCard = (props: { link: PostResponse }) => {
  const { link } = props;
  const navigate = useNavigate();
  const qetaApi = useApi(qetaApiRef);
  const editLinkRoute = useRouteRef(editLinkRouteRef);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkEntity, setLinkEntity] = useState(link);
  const { isModerator } = useIsModerator();
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const { t } = useTranslationRef(qetaTranslationRef);
  const onCommentAction = (l: PostResponse, _?: AnswerResponse) => {
    setLinkEntity(l);
  };
  const alertApi = useApi(alertApiRef);

  const restoreLink = async () => {
    qetaApi
      .restorePost(link.id)
      .catch(e =>
        alertApi.post({
          message: e.message,
          display: 'transient',
          severity: 'error',
        }),
      )
      .then(l => {
        if (l) {
          setLinkEntity(l);
        }
      });
  };

  return (
    <>
      <Card className={styles.root}>
        <CardBody>
          <Flex
            align="center"
            justify="between"
            gap="2"
            className={styles.header}
          >
            <a
              href={linkEntity.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkUrl}
              onClick={event => {
                event.stopPropagation();
                qetaApi.clickLink(linkEntity.id);
              }}
            >
              {linkEntity.url}
            </a>
            <Flex align="center" gap="1">
              <LinkButton entity={linkEntity} />
              <FavoriteButton entity={linkEntity} />
              <OpenLinkButton entity={linkEntity} />
            </Flex>
          </Flex>
          <Flex direction="column" gap="2" className={styles.content}>
            {linkEntity.headerImage && (
              <img
                src={linkEntity.headerImage}
                alt={linkEntity.title}
                onError={e => (e.currentTarget.style.display = 'none')}
                className={styles.headerImage}
              />
            )}
            <MarkdownRenderer content={linkEntity.content} />
          </Flex>
          <Flex
            align="start"
            justify="between"
            gap="4"
            className={styles.metadata}
          >
            <Box className={styles.metaMain}>
              <TagsAndEntities entity={linkEntity} />
              <Flex gap="2" className={styles.buttons}>
                {link.canEdit && link.status !== 'obsolete' && (
                  <Button
                    variant="secondary"
                    size="small"
                    iconStart={<RiEditLine size={16} />}
                    onClick={() =>
                      navigate(
                        editLinkRoute({
                          id: link.id.toString(10),
                        }),
                      )
                    }
                    className="qetaQuestionCardEditBtn"
                  >
                    {t('linkPage.editButton')}
                  </Button>
                )}
                {link.canDelete && (
                  <>
                    <Button
                      variant="secondary"
                      size="small"
                      destructive
                      onClick={handleDeleteModalOpen}
                      iconStart={<RiDeleteBinLine size={16} />}
                    >
                      {t('deleteModal.deleteButton')}
                    </Button>
                    <DeleteModal
                      open={deleteModalOpen}
                      onClose={handleDeleteModalClose}
                      entity={linkEntity}
                    />
                  </>
                )}
                {isModerator && linkEntity.status === 'deleted' && (
                  <Button
                    variant="primary"
                    size="small"
                    iconStart={<RiArrowGoBackLine size={16} />}
                    onClick={() => restoreLink()}
                    className="qetaLinkCardRestoreBtn"
                  >
                    {t('linkPage.restoreButton')}
                  </Button>
                )}
              </Flex>
            </Box>
            <AuthorBoxes entity={linkEntity} />
          </Flex>
        </CardBody>
      </Card>
      {(link.status === 'active' || link.status === 'obsolete') && (
        <CommentSection post={linkEntity} onCommentAction={onCommentAction} />
      )}
    </>
  );
};
