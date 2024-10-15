import { Box, Divider, List, ListItem, ListSubheader } from '@material-ui/core';
import React from 'react';
import { useEntityFollow, useStyles, useTranslation } from '../../utils/hooks';
import { EntityChip } from '../QuestionPage/EntityChip';

export const FollowedEntitiesList = () => {
  const classes = useStyles();
  const entities = useEntityFollow();
  const { t } = useTranslation();

  if (entities.entities.length === 0 || entities.loading) {
    return null;
  }

  return (
    <Box
      className={`qetaQuestionHighlightList ${classes.questionHighlightListContainer}`}
      display={{ md: 'none', lg: 'block' }}
    >
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={`qetaQuestionHighlightListList ${classes.questionHighlightList}`}
        subheader={
          <ListSubheader
            disableSticky
            component="div"
            id="nested-list-subheader"
            color="primary"
          >
            {t('rightMenu.followedEntities')}
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem style={{ display: 'block' }}>
          {entities.entities.map(entity => (
            <EntityChip key={entity} entity={entity} />
          ))}
        </ListItem>
      </List>
    </Box>
  );
};
