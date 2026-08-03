import { useRouteRef } from '@backstage/core-plugin-api';
import { useNavigate } from 'react-router-dom';
import { askRouteRef, createLinkRouteRef, writeRouteRef } from '../../routes';
import {
  PostType,
  selectByPostType,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useEntityQueryParameter } from '../../hooks/useEntityQueryParameter';
import { Button, Card, CardBody, Flex, Text } from '@backstage/ui';
import {
  RiEditLine,
  RiFileTextLine,
  RiLinkM,
  RiQuestionLine,
} from '@remixicon/react';
import styles from './NoPostsCard.module.css';

export const NoPostsCard = (props: {
  showNoPostsBtn?: boolean;
  entity?: string;
  entityPage?: boolean;
  tags?: string[];
  type?: PostType;
}) => {
  const { showNoPostsBtn, entity, entityPage, tags, type } = props;
  const askRoute = useRouteRef(askRouteRef);
  const writeRoute = useRouteRef(writeRouteRef);
  const linkRoute = useRouteRef(createLinkRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const entityRef = useEntityQueryParameter(entity) ?? entity;
  const navigate = useNavigate();

  const queryParams = new URLSearchParams();
  if (entityRef) {
    queryParams.set('entity', entityRef);
  }
  if (entityPage) {
    queryParams.set('entityPage', 'true');
  }
  if (tags && tags.length > 0) {
    queryParams.set('tags', tags.join(','));
  }

  const route = selectByPostType(
    type ?? 'question',
    askRoute,
    writeRoute,
    linkRoute,
  );

  const itemType = t(`common.${type ?? 'post'}`, {});
  return (
    <Card className={styles.card}>
      <CardBody>
        <Flex direction="column" align="center" justify="center" gap="4">
          <div className={styles.iconContainer}>
            {selectByPostType(
              type ?? 'question',
              <RiQuestionLine size={32} />,
              <RiFileTextLine size={32} />,
              <RiLinkM size={32} />,
            )}
          </div>
          <Text variant="title-x-small">
            {t('postsContainer.noItems', {
              itemType,
            })}
          </Text>
          {showNoPostsBtn && (
            <Button
              onClick={() =>
                navigate(
                  queryParams.size > 0
                    ? `${route()}?${queryParams.toString()}`
                    : `${route()}`,
                )
              }
              iconStart={selectByPostType(
                type ?? 'question',
                <RiQuestionLine />,
                <RiEditLine />,
                <RiLinkM />,
              )}
              variant="primary"
            >
              {t('postsContainer.createButton')}
            </Button>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};
