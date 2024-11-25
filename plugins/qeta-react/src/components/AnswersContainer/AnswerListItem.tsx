import { Link } from '@backstage/core-components';
import React from 'react';
import DOMPurify from 'dompurify';
import {
  AnswerResponse,
  removeMarkdownFormatting,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { useRouteRef } from '@backstage/core-plugin-api';
import { RelativeTimeWithTooltip } from '../RelativeTimeWithTooltip';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { VoteButtons } from '../Buttons/VoteButtons';
import { questionRouteRef, userRouteRef } from '../../routes';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import { Avatar, Grid, Typography } from '@material-ui/core';

export interface AnswerListItemProps {
  answer: AnswerResponse;
  entity?: string;
}

export const AnswerListItem = (props: AnswerListItemProps) => {
  const { answer, entity } = props;

  const questionRoute = useRouteRef(questionRouteRef);
  const userRoute = useRouteRef(userRouteRef);
  const { name, initials, user } = useEntityAuthor(answer);
  const { t } = useTranslation();

  const getAnswerLink = () => {
    return entity
      ? `${questionRoute({
          id: answer.postId.toString(10),
        })}?entity=${entity}#answer_${answer.id}`
      : `${questionRoute({
          id: answer.postId.toString(10),
        })}/#answer_${answer.id}`;
  };

  return (
    <Grid container spacing={2} justifyContent="flex-start">
      <Grid item justifyContent="center" style={{ paddingTop: '0px' }}>
        <VoteButtonContainer>
          <VoteButtons entity={answer} />
        </VoteButtonContainer>
      </Grid>
      <Grid item>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h5" component="div">
              <Link
                to={getAnswerLink()}
                className="qetaAnswerListItemQuestionBtn"
              >
                {t('answer.questionTitle', {
                  question: answer.post?.title ?? '',
                })}
              </Link>
            </Typography>
            <Typography
              variant="caption"
              noWrap
              component="div"
              className="qetaQuestionListItemContent"
              style={{ marginBottom: '5px' }}
            >
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(answer.content), 150),
              )}
            </Typography>
            <Grid item xs={12}>
              {answer.post && <TagsAndEntities entity={answer.post} />}
              <Typography variant="caption" display="inline">
                <Avatar
                  src={user?.spec?.profile?.picture}
                  alt={name}
                  variant="rounded"
                >
                  {initials}
                </Avatar>
                {answer.author === 'anonymous' ? (
                  t('common.anonymousAuthor')
                ) : (
                  <Link to={`${userRoute()}/${answer.author}`}>{name}</Link>
                )}{' '}
                <Link
                  to={getAnswerLink()}
                  className="qetaQuestionListItemQuestionBtn"
                >
                  {`${t('answer.answeredTime')} `}
                  <RelativeTimeWithTooltip value={answer.created} />
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
