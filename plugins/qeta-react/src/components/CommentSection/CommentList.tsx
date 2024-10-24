import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { Box, Divider, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from '@backstage/core-components';
import { useTranslation } from '../../utils/hooks';
import { useApi } from '@backstage/core-plugin-api';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AuthorLink } from '../Links/Links';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { qetaApiRef } from '../../api';

export const useStyles = makeStyles(
  _theme => {
    return {
      inline: {
        display: 'inline-block',
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

  return (
    <>
      {entity.comments?.map(c => {
        return (
          <>
            <Box key={c.id} className="qetaCommentBox">
              <MarkdownRenderer content={c.content} className={styles.inline} />
              {' – '}
              <AuthorLink entity={c} />{' '}
              <Typography variant="caption" className="qetaCommentTime">
                <RelativeTimeWithTooltip value={c.created} />
              </Typography>
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
            </Box>
            <Divider />
          </>
        );
      })}
    </>
  );
};
