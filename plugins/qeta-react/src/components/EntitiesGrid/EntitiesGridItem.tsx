import { EntityResponse } from '@drodil/backstage-plugin-qeta-common';
import { EntityFollowButton } from '../Buttons/EntityFollowButton';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
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
import { qetaTranslationRef } from '../../translation.ts';
import useGridItemStyles from '../GridItemStyles/useGridItemStyles';
import { ClickableLink } from '../Utility/ClickableLink';

const useStyles = makeStyles(theme => ({
  statsGrid: {
    marginTop: 'auto',
  },
  statItem: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const EntitiesGridItem = (props: { entity: EntityResponse }) => {
  const { entity } = props;
  const classes = useGridItemStyles();
  const localClasses = useStyles();
  const entityRoute = useRouteRef(entityRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const compound = parseEntityRef(entity.entityRef);
  const { primaryTitle, Icon, secondaryTitle } =
    useEntityPresentation(compound);

  const href = entityRoute({ entityRef: entity.entityRef });

  return (
    <Grid item xs={12} sm={6} md={6} xl={4}>
      <Card className={classes.card}>
        <ClickableLink href={href} ariaLabel={primaryTitle}>
          <Box
            className={classes.cardHeader}
            display="flex"
            alignItems="center"
          >
            {Icon && (
              <Avatar style={{ marginRight: 16 }}>
                <Icon />
              </Avatar>
            )}
            <Box flex={1} minWidth={0}>
              <Tooltip title={secondaryTitle ?? ''} arrow>
                <Typography variant="h6" noWrap>
                  {primaryTitle}
                </Typography>
              </Tooltip>
            </Box>
            <Box
              flexShrink={0}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <EntityFollowButton entityRef={entity.entityRef} />
            </Box>
          </Box>
          <CardContent
            className={`${classes.cardContent} ${localClasses.flexColumn}`}
          >
            <Grid container spacing={1} className={localClasses.statsGrid}>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <QuestionAnswerIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {entity.questionsCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('stats.questions', {})}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <DescriptionIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {entity.articlesCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('stats.articles', {})}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <LinkIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {entity.linksCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('stats.links', {})}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  className={localClasses.statItem}
                >
                  <PeopleIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {entity.followerCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t('stats.followers', {})}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </ClickableLink>
      </Card>
    </Grid>
  );
};
