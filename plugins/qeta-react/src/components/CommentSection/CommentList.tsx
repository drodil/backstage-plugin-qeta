import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React from 'react';
import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip/RelativeTimeWithTooltip';
import { AuthorLink } from '../Links/Links';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';
import { styled } from '@mui/system';

const CommentBox = styled('div', { name: 'QetaCommentBox' })({
  padding: '0.5em',
});

export const CommentList = (props: {
  onCommentDelete: (question: PostResponse, answer?: AnswerResponse) => void;
  question: PostResponse;
  answer?: AnswerResponse;
}) => {
  const { question, answer, onCommentDelete } = props;
  const entity = answer ?? question;
  const qetaApi = useApi(qetaApiRef);
  const { t } = useTranslation();

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
    <Box>
      {entity.comments?.map(c => {
        return (
          <div key={c.id}>
            <CommentBox>
              <MarkdownRenderer
                content={c.content}
                sx={{
                  display: 'inline',
                  '& *:last-child': {
                    display: 'inline',
                  },
                }}
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
            </CommentBox>
          </div>
        );
      })}
    </Box>
  );
};
