import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AuthorLink } from '../Links/Links';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';
import { Box, Divider, makeStyles, Typography } from '@material-ui/core';

export type QetaCommentListClassKey = 'content' | 'root' | 'box';

const useStyles = makeStyles(
  () => ({
    root: {},
    box: {
      padding: '0.5em',
    },
    content: {
      display: 'inline',
      '& *:last-child': {
        display: 'inline',
      },
    },
  }),
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
    <Box className={styles.root}>
      {entity.comments?.map((c, i) => {
        return (
          <div key={c.id}>
            {i > 0 && <Divider />}
            <Box className={styles.box}>
              <MarkdownRenderer
                content={c.content}
                className={styles.content}
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
          </div>
        );
      })}
    </Box>
  );
};
