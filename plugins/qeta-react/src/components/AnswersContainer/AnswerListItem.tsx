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
import { questionRouteRef } from '../../routes';
import { useTranslation } from '../../hooks';
import { useEntityAuthor } from '../../hooks/useEntityAuthor';
import { VoteButtonContainer } from '../Utility/VoteButtonContainer';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { SmallAvatar } from '../Utility/SmallAvatar';
import { UserLink } from '../Links';

const useStyles = makeStyles(() => ({
  author: {
    float: 'right',
    alignItems: 'center',
    display: 'flex',
  },
  timestamp: {
    marginLeft: '0.3em',
  },
}));

export interface AnswerListItemProps {
  answer: AnswerResponse;
  entity?: string;
}

export const AnswerListItem = (props: AnswerListItemProps) => {
  const { answer, entity } = props;

  const questionRoute = useRouteRef(questionRouteRef);
  const { name, initials, user } = useEntityAuthor(answer);
  const { t } = useTranslation();
  const styles = useStyles();

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
    <Grid
      container
      spacing={2}
      justifyContent="flex-start"
      style={{ padding: '0.7em', paddingBottom: '1.0em' }}
    >
      <Grid item style={{ paddingTop: '0px' }}>
        <VoteButtonContainer>
          <VoteButtons entity={answer} />
        </VoteButtonContainer>
      </Grid>
      <Grid
        item
        style={{ display: 'inline-block', width: 'calc(100% - 80px)' }}
      >
        <Grid container>
          <Grid item xs={12} style={{ paddingTop: '0px' }}>
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
              className="qetaAnswerListItemContent"
              style={{ marginBottom: '5px' }}
            >
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(answer.content), 150),
              )}
            </Typography>
            <Grid item xs={12} style={{ marginTop: '1em' }}>
              {answer.post && <TagsAndEntities entity={answer.post} />}
              <Typography
                variant="caption"
                display="inline"
                className={styles.author}
              >
                <SmallAvatar
                  src={user?.spec?.profile?.picture}
                  alt={name}
                  variant="rounded"
                >
                  {initials}
                </SmallAvatar>
                <UserLink entityRef={answer.author} />{' '}
                <Link to={getAnswerLink()} className={styles.timestamp}>
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
