import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityFollowButton } from '../Buttons/EntityFollowButton';
import {
  Avatar,
  Box,
  ListItemAvatar,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import { entityRouteRef } from '../../routes';
import { parseEntityRef } from '@backstage/catalog-model';

import LinkIcon from '@material-ui/icons/Link';
import DescriptionIcon from '@material-ui/icons/Description';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import PeopleIcon from '@material-ui/icons/People';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation';
import { Link } from 'react-router-dom';

import { useListItemStyles } from '../../hooks';

const useStyles = makeStyles(theme => ({
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontWeight: 600,
  },
  statsWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    marginLeft: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  actions: {
    marginLeft: theme.spacing(2),
  },
}));

export const EntityListItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const classes = useStyles();
  const listItemClasses = useListItemStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon, secondaryTitle } =
    useEntityPresentation(compound);

  const href = entityRoute({ entityRef: entity.entityRef });

  return (
    <Link to={href} className={listItemClasses.root}>
      <ListItemAvatar>
        <Avatar>
          {Icon ? <Icon /> : primaryTitle.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <Box className={classes.content}>
        <Tooltip title={secondaryTitle ?? ''} arrow placement="top-start">
          <Typography className={classes.title} noWrap>
            {primaryTitle}
          </Typography>
        </Tooltip>
      </Box>

      <Box className={classes.statsWrapper}>
        <Tooltip title={t('stats.questions', {})} arrow>
          <div className={classes.statItem}>
            <QuestionAnswerIcon fontSize="small" />
            <Typography variant="body2">{entity.questionsCount}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('stats.articles', {})} arrow>
          <div className={classes.statItem}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="body2">{entity.articlesCount}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('stats.links', {})} arrow>
          <div className={classes.statItem}>
            <LinkIcon fontSize="small" />
            <Typography variant="body2">{entity.linksCount}</Typography>
          </div>
        </Tooltip>
        <Tooltip title={t('stats.followers', {})} arrow>
          <div className={classes.statItem}>
            <PeopleIcon fontSize="small" />
            <Typography variant="body2">{entity.followerCount}</Typography>
          </div>
        </Tooltip>
      </Box>

      <Box
        className={classes.actions}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <EntityFollowButton entityRef={entity.entityRef} />
      </Box>
    </Link>
  );
};
