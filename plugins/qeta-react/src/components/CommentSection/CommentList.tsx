import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Box, Divider, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AuthorLink } from '../Links/Links';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';

export const useStyles = makeStyles(
  theme => {
    return {
      commentBox: {
        padding: theme.spacing(2),
        '&:hover': {
          backgroundColor: theme.palette.background.paper,
        },
      },
      markdown: {
        display: 'inline',
        '& *:first-child': {
          marginTop: 0,
        },
        '& *:last-child': {
          display: 'inline',
        },
      },
    };
  },
  { name: 'QetaCommentList' },
);

export const CommentList = (props: {
  onCommentDelete: (question: PostResponse, answer?: AnswerResponse) => void;
  question: PostResponse;
  answer?: AnswerResponse;
}) => {
  const { question, answer, onCommentDelete } = props;
  const entity = answer ?? question;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();
  const styles = useStyles();

  const deleteComment = (id: number) => {
    if (answer) {
      qetaApi.deleteAnswerComment(question.id, answer.id, id).then(a => {
        onCommentDelete(question, a);
        return;
      });
    }
    qetaApi.deletePostComment(question.id, id).then(q => onCommentDelete(q));
  };

  if (!entity.comments || entity.comments.length === 0) {
    return null;
  }

  return (
    <Box marginBottom={2}>
      {entity.comments?.map(c => {
        return (
          <div key={c.id}>
            <Box className={`${styles.commentBox} qetaCommentBox`}>
              <MarkdownRenderer
                content={c.content}
                className={styles.markdown}
              />
              <Typography variant="caption" className="qetaCommentMetadata">
                {' – '}
                <AuthorLink entity={c} />{' '}
                <RelativeTimeWithTooltip value={c.created} />
                {(c.own || c.canDelete) && (
                  <>
                    {' / '}
                    <Link
                      underline="none"
                      to="#"
                      className="qetaCommentDeleteBtn"
                      onClick={() => deleteComment(c.id)}
                    >
                      {t('commentList.deleteLink')}
                    </Link>
                  </>
                )}
              </Typography>
            </Box>
            <Divider />
          </div>
        );
      })}
    </Box>
  );
};
