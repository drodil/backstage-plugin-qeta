import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useState } from 'react';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import RestoreIcon from '@material-ui/icons/Restore';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { LinkButton } from '../Buttons/LinkButton';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { editLinkRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { useIsModerator } from '../../hooks';
import { AuthorBoxes } from '../AuthorBox/AuthorBoxes.tsx';
import { OpenLinkButton } from "../Buttons/OpenLinkButton.tsx";
import { qetaApiRef } from "../../api.ts";

export type LinkCardClassKeys =
  | 'root'
  | 'contentContainer'
  | 'markdownContainer'
  | 'buttons'
  | 'metadata';

const useStyles = makeStyles(
  theme => ({
    root: {},
    contentContainer: {
      marginLeft: '0.5em',
      width: 'calc(100% - 70px)',
    },
    markdownContainer: {
      paddingBottom: '0.5em',
    },
    buttons: {
      marginTop: '1em',
      '& *:not(:last-child)': {
        marginRight: '0.3em',
      },
    },
    metadata: {
      marginTop: theme.spacing(3),
    },
  }),
  { name: 'QetaLinkCard' },
);

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
  const onCommentAction = (q: PostResponse, _?: AnswerResponse) => {
    setLinkEntity(q);
  };
  const styles = useStyles();


  return (
    <>
      <Card variant="outlined" className={styles.root}>
        <CardContent>
          <Box display="flex" justifyContent="flex-end" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="center" flexGrow={1}>
              <a
                href={linkEntity.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 400,
                  fontSize: '1.2rem',
                  marginRight: 16,
                  wordBreak: 'break-all',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
                onClick={event => {
                  event.stopPropagation();
                  qetaApi.clickLink(linkEntity.id);
                }}
              >
                {linkEntity.url}
              </a>
            </Box>
            <LinkButton entity={linkEntity} />
            <FavoriteButton entity={linkEntity} />
            <OpenLinkButton entity={linkEntity} />
          </Box>
          <Grid
            container
            spacing={2}
            justifyContent="flex-start"
            style={{ flexWrap: 'nowrap' }}
          >
            <Grid
              item
              className={styles.contentContainer}
              style={{ flexGrow: '1' }}
            >
              <Grid item className={styles.markdownContainer}>
                <MarkdownRenderer content={linkEntity.content} />
              </Grid>
              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                className={styles.metadata}
                style={{ width: '100%' }}
              >
                <Box flex="1 1 0%" minWidth={0}>
                  <TagsAndEntities entity={linkEntity} />
                  <Box className={styles.buttons}>
                    {(link.canEdit || link.canDelete) && (
                      <>
                        {link.canEdit && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
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
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={handleDeleteModalOpen}
                              startIcon={<DeleteIcon />}
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
                      </>
                    )}
                    {isModerator && linkEntity.status === 'deleted' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => {}} // TODO:
                        className="qetaQuestionCardRestoreBtn"
                      >
                        {t('questionPage.restoreButton')}
                      </Button>
                    )}
                  </Box>
                </Box>
                <AuthorBoxes entity={linkEntity} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {link.status === 'active' && (
        <CommentSection post={linkEntity} onCommentAction={onCommentAction} />
      )}
    </>
  );
};
