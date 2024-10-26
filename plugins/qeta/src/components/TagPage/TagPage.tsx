import React, { useEffect } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  FollowedTagsList,
  MarkdownRenderer,
  PostHighlightList,
  PostsContainer,
  qetaApiRef,
  TagFollowButton,
  TagsGrid,
  useTranslation,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import Whatshot from '@material-ui/icons/Whatshot';
import { useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslation();
  const [resp, setResp] = React.useState<undefined | TagResponse>();

  const qetaApi = useApi(qetaApiRef);

  useEffect(() => {
    if (!tag) {
      setResp(undefined);
      return;
    }

    qetaApi.getTag(tag).then(res => {
      if (res) {
        setResp(res);
      }
    });
  }, [qetaApi, tag]);

  return (
    <Grid container spacing={4}>
      <Grid item md={12} lg={9} xl={10}>
        <ContentHeader title={tag ? `#${tag}` : t('tagPage.defaultTitle')}>
          {tag && <TagFollowButton tag={tag} />}
          <AskQuestionButton tags={tag ? [tag] : undefined} />
          <WriteArticleButton tags={tag ? [tag] : undefined} />
        </ContentHeader>
        {resp && (
          <Card variant="outlined" style={{ marginBottom: '1rem' }}>
            <CardContent>
              <Typography variant="caption">
                {t('common.posts', {
                  count: resp.postsCount,
                  itemType: 'post',
                })}
                {' · '}
                {t('common.followers', { count: resp.followerCount })}
              </Typography>
              {resp.description && (
                <MarkdownRenderer content={resp.description} />
              )}
            </CardContent>
          </Card>
        )}
        {tag ? <PostsContainer tags={[tag ?? '']} /> : <TagsGrid />}
      </Grid>
      <Grid item lg={3} xl={2}>
        <FollowedTagsList />
        {resp && (
          <>
            <PostHighlightList
              type="hot"
              title={t('highlights.hotQuestions.title')}
              noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
              icon={<Whatshot fontSize="small" />}
              options={{ tags: [resp.tag] }}
              postType="question"
            />

            <PostHighlightList
              type="unanswered"
              title={t('highlights.unanswered.title')}
              noQuestionsLabel={t('highlights.unanswered.noQuestionsLabel')}
              options={{ tags: [resp.tag] }}
              postType="question"
            />
            <PostHighlightList
              type="incorrect"
              title={t('highlights.incorrect.title')}
              noQuestionsLabel={t('highlights.incorrect.noQuestionsLabel')}
              options={{ tags: [resp.tag] }}
              postType="question"
            />
          </>
        )}
        {!resp && (
          <>
            <PostHighlightList
              type="hot"
              title={t('highlights.hotQuestions.title')}
              noQuestionsLabel={t('highlights.hotQuestions.noQuestionsLabel')}
              icon={<Whatshot fontSize="small" />}
              postType="question"
            />
            <PostHighlightList
              type="hot"
              title={t('highlights.hotArticles.title')}
              noQuestionsLabel={t('highlights.hotArticles.noArticlesLabel')}
              icon={<Whatshot fontSize="small" />}
              postType="article"
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};
