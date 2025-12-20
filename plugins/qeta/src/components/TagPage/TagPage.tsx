import { useEffect, useState } from 'react';
import { ContentHeader } from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import {
  AskQuestionButton,
  ButtonContainer,
  CreateLinkButton,
  PostsContainer,
  PostsGrid,
  qetaApiRef,
  qetaTranslationRef,
  TagFollowButton,
  TagsGrid,
  ViewType,
  WriteArticleButton,
} from '@drodil/backstage-plugin-qeta-react';
import LocalOfferOutlined from '@material-ui/icons/LocalOfferOutlined';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { TagResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { ContentHeaderCard } from '@drodil/backstage-plugin-qeta-react';
import { Typography } from '@material-ui/core';

export const TagPage = () => {
  const { tag } = useParams();
  const { t } = useTranslationRef(qetaTranslationRef);
  const [resp, setResp] = useState<undefined | TagResponse>();
  const [view, setView] = useState<ViewType>('list');

  const qetaApi = useApi(qetaApiRef);
  const alertApi = useApi(alertApiRef);

  useEffect(() => {
    if (!tag) {
      setResp(undefined);
      return;
    }

    qetaApi
      .getTag(tag)
      .then(res => {
        if (res) {
          setResp(res);
        }
      })
      .catch(e => {
        alertApi.post({
          message: e.message,
          severity: 'error',
          display: 'transient',
        });
      });
  }, [qetaApi, tag, alertApi]);

  return (
    <>
      {tag ? (
        <ContentHeader
          titleComponent={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                component="h2"
                id="tag-title"
                style={{
                  marginRight: '0.5em',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LocalOfferOutlined
                  fontSize="large"
                  style={{ marginRight: '8px' }}
                />
                {tag}
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
        <ContentHeader
          titleComponent={
            <Typography
              variant="h4"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <LocalOfferOutlined
                fontSize="large"
                style={{ marginRight: '8px' }}
              />
              {t('tagPage.defaultTitle')}
            </Typography>
          }
        >
          <ButtonContainer>
            <AskQuestionButton />
            <WriteArticleButton />
            <CreateLinkButton />
          </ButtonContainer>
        </ContentHeader>
      )}
      {resp && (
        <ContentHeaderCard
          description={resp.description}
          imageIcon={<LocalOfferOutlined style={{ fontSize: 80 }} />}
          stats={[
            {
              label: t('common.postsLabel', {
                count: resp.postsCount,
                itemType: 'post',
              }),
              value: resp.postsCount,
              icon: <QuestionAnswerIcon fontSize="small" />,
            },
            {
              label: t('common.followersLabel', { count: resp.followerCount }),
              value: resp.followerCount,
              icon: <PeopleIcon fontSize="small" />,
            },
          ]}
        >
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
        </ContentHeaderCard>
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
    </>
  );
};
