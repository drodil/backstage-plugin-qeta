import { useEffect, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  ButtonContainer,
  CreateLinkButton,
  FollowedTagsList,
  MarkdownRenderer,
  PostHighlightList,
  PostsContainer,
  PostsGrid,
  qetaApiRef,
  qetaTranslationRef,
  TagFollowButton,
  TagsGrid,
  ViewType,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import Whatshot from '@material-ui/icons/Whatshot';
import { useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [resp, setResp] = useState<undefined | TagResponse>();
  const [view, setView] = useState<ViewType>('list');

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
        {tag ? (
          <ContentHeader
            titleComponent={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="h5"
                  component="h2"
                  id="tag-title"
                  style={{ marginRight: '0.5em' }}
                >
                  #{tag}
                </Typography>
                <TagFollowButton tag={tag} />
              </span>
            }
          >
            <ButtonContainer>
              <AskQuestionButton tags={[tag]} />
              <WriteArticleButton tags={[tag]} />
              <CreateLinkButton tags={[tag]} />
            </ButtonContainer>
          </ContentHeader>
        ) : (
          <ContentHeader title={t('tagPage.defaultTitle')}>
            <ButtonContainer>
              <AskQuestionButton />
              <WriteArticleButton />
              <CreateLinkButton />
            </ButtonContainer>
          </ContentHeader>
        )}
        {resp && (
          <Card variant="outlined" style={{ marginBottom: '1em' }}>
            <CardContent>
              <Typography variant="caption">
                {t('common.posts', {
                  count: resp.postsCount,
                  itemType: 'post',
                })}
                {' · '}
                {t('common.followers', { count: resp.followerCount })}
              </Typography>
              <br />
              {resp.experts && resp.experts.length > 0 && (
                <Typography variant="caption">
                  {t('common.experts')}
                  {': '}
                  {resp.experts.map((e, i) => (
                    <>
                      <EntityRefLink key={e} entityRef={e} />
                      {i === resp.experts!.length - 1 ? '' : ','}
                    </>
                  ))}
                </Typography>
              )}
              {resp.description && (
                <MarkdownRenderer content={resp.description} />
              )}
            </CardContent>
          </Card>
        )}
        {tag &&
          (view === 'grid' ? (
            <PostsGrid
              tags={[tag ?? '']}
              filterPanelProps={{ showTagFilter: false }}
              view={view}
              onViewChange={setView}
            />
          ) : (
            <PostsContainer
              tags={[tag ?? '']}
              filterPanelProps={{ showTagFilter: false }}
              view={view}
              showTypeLabel
              onViewChange={setView}
            />
          ))}
        {!tag && <TagsGrid />}
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
            <PostHighlightList
              type="hot"
              title={t('highlights.hotLinks.title')}
              noQuestionsLabel={t('highlights.hotLinks.noLinksLabel')}
              icon={<Whatshot fontSize="small" />}
              postType="link"
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};
