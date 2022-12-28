import { QuestionResponse } from '../../api';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { useEffect } from 'react';
import { MarkdownContent } from '@backstage/core-components';
import { VoteButtons } from './VoteButtons';
import { useStyles } from '../../utils/hooks';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  formatUsername,
  getEntityTitle,
  getEntityUrl,
} from '../../utils/utils';
import { compact } from 'lodash';
// @ts-ignore
import RelativeTime from 'react-relative-time';

export const QuestionCard = (props: { question: QuestionResponse }) => {
  const { question } = props;
  const styles = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [components, setComponents] = React.useState<Entity[]>([]);

  useEffect(() => {
    if (question.components) {
      catalogApi
        .getEntitiesByRefs({
          entityRefs: question.components,
        })
        .catch(_ => setComponents([]))
        .then(data =>
          data ? setComponents(compact(data.items)) : setComponents([]),
        );
    }
  }, [catalogApi, question]);

  return (
    <Card variant="outlined">
      <CardContent>
        <div className={styles.questionCardVote}>
          <VoteButtons entity={question} />
        </div>
        <div className={styles.questionCardContent}>
          <Typography variant="body1" gutterBottom>
            <MarkdownContent content={question.content} dialect="gfm" />
          </Typography>
          <Box className={styles.questionCardMetadata}>
            <Grid container spacing={0} justifyContent="space-around">
              <Grid item xs={8}>
                {question.tags &&
                  question.tags.map(tag => (
                    <Chip
                      label={tag}
                      size="small"
                      component="a"
                      href={`/qeta/tags/${tag}`}
                      clickable
                    />
                  ))}
                {components &&
                  components.map(component => (
                    <Tooltip
                      title={
                        component.metadata.description?.slice(0, 50) ??
                        stringifyEntityRef(component)
                      }
                      arrow
                    >
                      <Chip
                        label={getEntityTitle(component)}
                        size="small"
                        variant="outlined"
                        component="a"
                        href={getEntityUrl(component)}
                        clickable
                      />
                    </Tooltip>
                  ))}
              </Grid>
              <Grid item xs={4} className={styles.questionCardAuthor}>
                Asked <RelativeTime value={question.created} /> by{' '}
                <Link href={`/qeta/users/${question.author}`}>
                  {formatUsername(question.author)}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </div>
      </CardContent>
    </Card>
  );
};
