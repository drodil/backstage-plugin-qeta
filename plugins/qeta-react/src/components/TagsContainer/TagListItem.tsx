import { useState } from 'react';
import {
  removeMarkdownFormatting,
  TagResponse,
  truncate,
} from '@drodil/backstage-plugin-qeta-common';
import { TagFollowButton } from '../Buttons/TagFollowButton';
import {
  ButtonIcon,
  Flex,
  Menu,
  MenuItem,
  MenuTrigger,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
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
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';

import { useListItemStyles, useQetaConfig } from '../../hooks';
import styles from './TagListItem.module.css';

export const TagListItem = (props: {
  tag: TagResponse;
  onTagEdit: () => void;
  isModerator?: boolean;
}) => {
  const { tag, onTagEdit, isModerator } = props;
  const tagRoute = useRouteRef(tagRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const listItemClasses = useListItemStyles();
  const { disabled } = useQetaConfig();

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
      <Link to={href} className={listItemClasses.root}>
        <RiPriceTag3Line className={styles.icon} size={20} />
        <div className={styles.content}>
          <Text weight="bold">{tag.tag}</Text>
          {tag.description && (
            <Text
              className={styles.description}
              variant="body-small"
              color="secondary"
            >
              {DOMPurify.sanitize(
                truncate(removeMarkdownFormatting(tag.description), 100),
              )}
            </Text>
          )}
        </div>

        <div className={styles.statsWrapper}>
          {!disabled.questions && (
            <TooltipTrigger>
              <div className={styles.statItem}>
                <RiQuestionLine size={16} />
                <Text variant="body-small">{tag.questionsCount}</Text>
              </div>
              <Tooltip>{t('common.questions')}</Tooltip>
            </TooltipTrigger>
          )}
          {!disabled.articles && (
            <TooltipTrigger>
              <div className={styles.statItem}>
                <RiFileTextLine size={16} />
                <Text variant="body-small">{tag.articlesCount}</Text>
              </div>
              <Tooltip>{t('common.articles')}</Tooltip>
            </TooltipTrigger>
          )}
          {!disabled.links && (
            <TooltipTrigger>
              <div className={styles.statItem}>
                <RiLink size={16} />
                <Text variant="body-small">{tag.linksCount}</Text>
              </div>
              <Tooltip>{t('common.links')}</Tooltip>
            </TooltipTrigger>
          )}
          <TooltipTrigger>
            <div className={styles.statItem}>
              <RiGroupLine size={16} />
              <Text variant="body-small">{tag.followerCount}</Text>
            </div>
            <Tooltip>{t('common.followersPlain')}</Tooltip>
          </TooltipTrigger>
        </div>

        <Flex
          align="center"
          className={styles.actions}
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
      </Link>
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
