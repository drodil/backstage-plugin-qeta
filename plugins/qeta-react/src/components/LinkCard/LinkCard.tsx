import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useState } from 'react';
import { FavoriteButton } from '../Buttons/FavoriteButton';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { CommentSection } from '../CommentSection/CommentSection';
import { useApi } from '@backstage/core-plugin-api';
import { LinkButton } from '../Buttons/LinkButton';
import { MarkdownRenderer } from '../MarkdownRenderer/MarkdownRenderer';
import { Box, Card, CardBody, Flex } from '@backstage/ui';
import { AuthorBoxes } from '../AuthorBox/AuthorBoxes.tsx';
import { OpenLinkButton } from '../Buttons/OpenLinkButton.tsx';
import { qetaApiRef } from '../../api.ts';
import styles from './LinkCard.module.css';

export const LinkCard = (props: { link: PostResponse }) => {
  const { link } = props;
  const qetaApi = useApi(qetaApiRef);
  const [linkEntity, setLinkEntity] = useState(link);
  const onCommentAction = (l: PostResponse, _?: AnswerResponse) => {
    setLinkEntity(l);
  };

  return (
    <>
      <Card className={styles.root}>
        <CardBody>
          <Flex
            align="center"
            justify="between"
            gap="2"
            className={styles.header}
          >
            <a
              href={linkEntity.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkUrl}
              onClick={event => {
                event.stopPropagation();
                qetaApi.clickLink(linkEntity.id);
              }}
            >
              {linkEntity.url}
            </a>
            <Flex align="center" gap="1">
              <LinkButton entity={linkEntity} />
              <FavoriteButton entity={linkEntity} />
              <OpenLinkButton entity={linkEntity} />
            </Flex>
          </Flex>
          <Flex direction="column" gap="2" className={styles.content}>
            {linkEntity.headerImage && (
              <img
                src={linkEntity.headerImage}
                alt={linkEntity.title}
                onError={e => (e.currentTarget.style.display = 'none')}
                className={styles.headerImage}
              />
            )}
            <MarkdownRenderer content={linkEntity.content} />
          </Flex>
          <Flex
            align="start"
            justify="between"
            gap="4"
            className={styles.metadata}
          >
            <Box className={styles.metaMain}>
              <TagsAndEntities entity={linkEntity} />
            </Box>
            <AuthorBoxes entity={linkEntity} />
          </Flex>
        </CardBody>
      </Card>
      {(link.status === 'active' || link.status === 'obsolete') && (
        <CommentSection post={linkEntity} onCommentAction={onCommentAction} />
      )}
    </>
  );
};
