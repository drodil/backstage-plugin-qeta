import {
  removeMarkdownFormatting,
  TagResponse,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import type { Columns } from '@backstage/ui';
import {
  Box,
  ButtonIcon,
  Card,
  Flex,
  Grid,
  Menu,
  MenuItem,
  MenuTrigger,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { useState } from 'react';
import { useRouteRef } from '@backstage/core-plugin-api';
import { tagRouteRef } from '../../routes';
import { EditTagModal } from './EditTagModal';
import DOMPurify from 'dompurify';
import { DeleteModal } from '../Modals';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileTextLine,
  RiGroupLine,
  RiLink,
  RiMore2Line,
  RiPriceTag3Line,
  RiQuestionLine,
} from '@remixicon/react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { ClickableLink } from '../Utility/ClickableLink';
import { useQetaConfig } from '../../hooks';
import styles from './TagGridItem.module.css';

export const TagGridItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
}) => {
  const { tag, onTagEdit, isModerator } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useGridItemStyles();
  const { disabled } = useQetaConfig();

  const enabledStatsCount = [
    !disabled.questions,
    !disabled.articles,
    !disabled.links,
    true,
  ].filter(Boolean).length;
  const statColSpan = String(Math.floor(12 / enabledStatsCount)) as Columns;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const handleEditModalOpen = () => {
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setEditModalOpen(false);
    onTagEdit();
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleDeleteModalOpen = () => {
    setDeleteModalOpen(true);
  };
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    onTagEdit();
  };

  const href = tagRoute({ tag: tag.tag });

  return (
    <>
      <Card className={classes.card}>
        <ClickableLink href={href} ariaLabel={tag.tag}>
          <Flex align="center" className={classes.cardHeader}>
            <div className={styles.iconAvatar}>
              <RiPriceTag3Line size={16} />
            </div>
            <Box grow={1} minWidth="0">
              <TooltipTrigger>
                <Text variant="title-x-small" weight="bold" truncate as="div">
                  {tag.tag}
                </Text>
                <Tooltip>{tag.tag}</Tooltip>
              </TooltipTrigger>
            </Box>
            <Flex
              align="center"
              shrink={0}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <TagFollowButton tag={tag.tag} />
              {(tag.canEdit || tag.canDelete) && (
                <MenuTrigger>
                  <ButtonIcon
                    aria-label="settings"
                    icon={<RiMore2Line />}
                    variant="tertiary"
                    size="small"
                  />
                  <Menu>
                    {tag.canEdit && (
                      <MenuItem
                        iconStart={<RiEditLine size={16} />}
                        onAction={handleEditModalOpen}
                      >
                        {t('tagButton.edit')}
                      </MenuItem>
                    )}
                    {tag.canDelete && (
                      <MenuItem
                        iconStart={<RiDeleteBinLine size={16} />}
                        color="danger"
                        onAction={handleDeleteModalOpen}
                      >
                        {t('tagButton.delete')}
                      </MenuItem>
                    )}
                  </Menu>
                </MenuTrigger>
              )}
            </Flex>
          </Flex>
          <div className={`${classes.cardContent} ${styles.flexColumn}`}>
            {tag.description && (
              <Box mb="2">
                <TooltipTrigger>
                  <Text
                    className={classes.description}
                    variant="body-small"
                    as="div"
                  >
                    {DOMPurify.sanitize(
                      truncate(removeMarkdownFormatting(tag.description), 80),
                    )}
                  </Text>
                  <Tooltip>{tag.description}</Tooltip>
                </TooltipTrigger>
              </Box>
            )}

            <Grid.Root
              columns={{ sm: '12' }}
              gap="2"
              className={styles.statsGrid}
            >
              {!disabled.questions && (
                <Grid.Item
                  colSpan={{ sm: statColSpan }}
                  className={styles.statItem}
                >
                  <Flex direction="column" align="center" gap="0.5">
                    <RiQuestionLine size={16} />
                    <Text variant="body-small" weight="bold">
                      {tag.questionsCount}
                    </Text>
                    <Text variant="body-x-small" color="secondary">
                      {t('common.questions')}
                    </Text>
                  </Flex>
                </Grid.Item>
              )}
              {!disabled.articles && (
                <Grid.Item
                  colSpan={{ sm: statColSpan }}
                  className={styles.statItem}
                >
                  <Flex direction="column" align="center" gap="0.5">
                    <RiFileTextLine size={16} />
                    <Text variant="body-small" weight="bold">
                      {tag.articlesCount}
                    </Text>
                    <Text variant="body-x-small" color="secondary">
                      {t('common.articles')}
                    </Text>
                  </Flex>
                </Grid.Item>
              )}
              {!disabled.links && (
                <Grid.Item
                  colSpan={{ sm: statColSpan }}
                  className={styles.statItem}
                >
                  <Flex direction="column" align="center" gap="0.5">
                    <RiLink size={16} />
                    <Text variant="body-small" weight="bold">
                      {tag.linksCount}
                    </Text>
                    <Text variant="body-x-small" color="secondary">
                      {t('common.links')}
                    </Text>
                  </Flex>
                </Grid.Item>
              )}
              <Grid.Item
                colSpan={{ sm: statColSpan }}
                className={styles.statItem}
              >
                <Flex direction="column" align="center" gap="0.5">
                  <RiGroupLine size={16} />
                  <Text variant="body-small" weight="bold">
                    {tag.followerCount}
                  </Text>
                  <Text variant="body-x-small" color="secondary">
                    {t('common.followersPlain')}
                  </Text>
                </Flex>
              </Grid.Item>
            </Grid.Root>
          </div>
        </ClickableLink>
      </Card>
      <EditTagModal
        tag={tag}
        open={editModalOpen}
        onClose={handleEditModalClose}
        isModerator={isModerator}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        entity={tag}
      />
    </>
  );
};
