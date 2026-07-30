import { useTagsFollow, useQetaConfig } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import { List, ListRow } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { RiPriceTag3Line } from '@remixicon/react';
import { Link } from 'react-router-dom';
import { tagRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { TagTooltip } from '../Tooltips';
import styles from './FollowedTagsList.module.css';

export const FollowedTagsList = () => {
  const tags = useTagsFollow();
  const { t } = useTranslationRef(qetaTranslationRef);
  const tagRoute = useRouteRef(tagRouteRef);
  const { disabled } = useQetaConfig();

  if (disabled.tags || tags.tags.length === 0 || tags.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedTags')} limit={5} randomize>
        {tags.tags.map(tag => {
          const href = tagRoute({ tag: tag });
          return (
            <TagTooltip
              key={tag}
              tag={tag}
              interactive={false}
              enterDelay={400}
              enterNextDelay={400}
              placement="left"
            >
              <Link to={href} className={styles.link}>
                <List>
                  <ListRow icon={<RiPriceTag3Line size={16} />}>
                    {`${tag}`}
                  </ListRow>
                </List>
              </Link>
            </TagTooltip>
          );
        })}
      </RightList>
    </RightListContainer>
  );
};
