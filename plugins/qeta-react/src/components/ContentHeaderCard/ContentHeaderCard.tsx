import { ReactNode } from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { Collection } from '@drodil/backstage-plugin-qeta-common';
import styles from './ContentHeaderCard.module.css';

export interface ContentHeaderCardProps {
  title?: ReactNode;
  description?: string;
  image?: string;
  imageIcon?: ReactNode;
  tagsAndEntities?: {
    entity?: Collection;
    tags?: string[];
    entities?: string[];
  };
  stats?: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
  }[];
  actions?: ReactNode;
  children?: ReactNode;
}

export const ContentHeaderCard = (props: ContentHeaderCardProps) => {
  const {
    title,
    description,
    image,
    imageIcon,
    stats,
    tagsAndEntities,
    actions,
    children,
  } = props;

  return (
    <Card className={styles.card}>
      <CardBody className={styles.content}>
        <Flex gap="6" align="start" className={styles.mediaRow}>
          {(image || imageIcon) && (
            <Box className={styles.mediaContainer}>
              {image ? (
                <img src={image} alt="" className={styles.media} />
              ) : (
                <Box className={`${styles.media} ${styles.mediaIcon}`}>
                  {imageIcon}
                </Box>
              )}
            </Box>
          )}

          <Flex direction="column" className={styles.headerContent}>
            <Flex justify="between" align="start" className={styles.titleRow}>
              <Box>
                {title && (
                  <Text as="h1" variant="title-large" weight="bold">
                    {title}
                  </Text>
                )}
              </Box>
              {actions && <Box>{actions}</Box>}
            </Flex>

            {description && (
              <Box className={styles.description}>
                <MarkdownRenderer content={description} />
              </Box>
            )}

            {tagsAndEntities &&
              (tagsAndEntities.entity ||
                (tagsAndEntities.tags && tagsAndEntities.tags.length > 0) ||
                (tagsAndEntities.entities &&
                  tagsAndEntities.entities.length > 0)) && (
                <Box className={styles.tagsRow}>
                  <TagsAndEntities
                    entity={
                      tagsAndEntities.entity ||
                      ({
                        tags: tagsAndEntities.tags,
                        entities: tagsAndEntities.entities,
                      } as any)
                    }
                  />
                </Box>
              )}

            {stats && stats.length > 0 && (
              <Flex className={styles.statsRow}>
                {stats.map((stat, index) => (
                  <TooltipTrigger key={index}>
                    <Box className={styles.statItem}>
                      <Text className={styles.statValue}>
                        {stat.icon} {stat.value}
                      </Text>
                      <Text className={styles.statLabel}>{stat.label}</Text>
                    </Box>
                    <Tooltip>{stat.label}</Tooltip>
                  </TooltipTrigger>
                ))}
              </Flex>
            )}
            {children && <Box className={styles.children}>{children}</Box>}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};
