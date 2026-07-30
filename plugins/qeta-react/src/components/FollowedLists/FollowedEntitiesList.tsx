import { useEntityFollow, useQetaConfig } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import { List, ListRow } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';
import { entityRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { EntityTooltip } from '../Tooltips';
import styles from './FollowedEntitiesList.module.css';

const FollowedEntityItem = ({ entityRef }: { entityRef: string }) => {
  const entityRoute = useRouteRef(entityRouteRef);
  const { primaryTitle, Icon } = useEntityPresentation(entityRef);
  const href = entityRoute({ entityRef: entityRef });

  return (
    <EntityTooltip
      entity={entityRef}
      interactive={false}
      enterDelay={400}
      enterNextDelay={400}
      placement="left"
    >
      <Link to={href} className={styles.link}>
        <List>
          <ListRow icon={Icon ? <Icon fontSize="small" /> : undefined}>
            {primaryTitle ?? entityRef}
          </ListRow>
        </List>
      </Link>
    </EntityTooltip>
  );
};

export const FollowedEntitiesList = () => {
  const entities = useEntityFollow();
  const { t } = useTranslationRef(qetaTranslationRef);
  const { disabled } = useQetaConfig();

  if (disabled.entities || entities.entities.length === 0 || entities.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedEntities')} limit={5} randomize>
        {entities.entities.map(entity => (
          <FollowedEntityItem key={entity} entityRef={entity} />
        ))}
      </RightList>
    </RightListContainer>
  );
};
