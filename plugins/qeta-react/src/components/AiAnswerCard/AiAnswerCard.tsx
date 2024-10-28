import { Post } from '@drodil/backstage-plugin-qeta-common';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { useTranslation } from '../../hooks';
import FlareIcon from '@material-ui/icons/Flare';

export type QetaAiAnswerCardClassKey = 'card';

const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      card: {
        marginTop: theme.spacing(3),
        backgroundColor: theme.palette.background.default,
        border: `3px solid ${theme.palette.status.ok}`,
      },
      markdown: {},
    }),
  { name: 'QetaAiAnswerCard' },
);

export const AiAnswerCard = (props: { question: Post }) => {
  const { question } = props;
  const [answer, setAnswer] = React.useState<string | undefined>(undefined);
  const qetaApi = useApi(qetaApiRef);
  const styles = useStyles();
  const { t } = useTranslation();

  useEffect(() => {
    if (question.type !== 'question') {
      return;
    }

    qetaApi.getAiAnswer(question.id).then(resp => {
      setAnswer(resp?.response);
    });
  }, [qetaApi, question.id, question.type]);

  if (question.type !== 'question' || !answer) {
    return null;
  }

  return (
    <Card className={styles.card}>
      <CardHeader
        avatar={<FlareIcon />}
        title={<Typography variant="h5">{t('aiAnswerCard.title')}</Typography>}
      />
      <CardContent>
        <MarkdownRenderer content={answer} className={styles.markdown} />
      </CardContent>
    </Card>
  );
};
