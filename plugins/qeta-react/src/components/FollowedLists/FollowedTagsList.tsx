import { useTagsFollow } from '../../hooks';
import { RightList, RightListContainer } from '../Utility/RightList';
import {
  Box,
  ListItem,
  ListItemText,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import LocalOfferOutlined from '@material-ui/icons/LocalOfferOutlined';
import { Link } from 'react-router-dom';
import { tagRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
    minHeight: 28,
    cursor: 'pointer',
    transition: 'background 0.2s',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  listItemText: {
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  iconBox: {
    minWidth: 28,
    maxWidth: 28,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
}));

export const FollowedTagsList = () => {
  const tags = useTagsFollow();
  const { t } = useTranslationRef(qetaTranslationRef);
  const classes = useStyles();
  const tagRoute = useRouteRef(tagRouteRef);

  if (tags.tags.length === 0 || tags.loading) {
    return null;
  }

  return (
    <RightListContainer>
      <RightList title={t('rightMenu.followedTags')}>
        {tags.tags.map(tag => {
          const href = tagRoute({ tag: tag });
          return (
            <ListItem
              key={tag}
              dense
              button
              className={classes.listItem}
              component={Link}
              to={href}
            >
              <Box className={classes.iconBox}>
                <LocalOfferOutlined fontSize="small" />
              </Box>
              <Tooltip title={tag} arrow>
                <ListItemText
                  primary={`${tag}`}
                  classes={{ primary: classes.listItemText }}
                />
              </Tooltip>
            </ListItem>
          );
        })}
      </RightList>
    </RightListContainer>
  );
};
