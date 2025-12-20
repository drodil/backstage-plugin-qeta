import { ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';
import { Collection } from '@drodil/backstage-plugin-qeta-common';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  content: {
    padding: theme.spacing(3),
    '&:last-child': {
      paddingBottom: theme.spacing(3),
    },
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  statsRow: {
    display: 'flex',
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  description: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  media: {
    height: 180,
    width: 180,
    borderRadius: theme.shape.borderRadius,
    objectFit: 'cover',
    objectPosition: '50% 50%',
    boxShadow: theme.shadows[2],
  },
  mediaContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      paddingRight: 0,
      marginBottom: theme.spacing(2),
    },
  },
}));

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
  const classes = useStyles();

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent className={classes.content}>
        <Grid container>
          {(image || imageIcon) && (
            <Grid item>
              <Box className={classes.mediaContainer}>
                {image ? (
                  <CardMedia
                    className={classes.media}
                    image={image}
                    component="img"
                  />
                ) : (
                  <Box
                    className={classes.media}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="background.default"
                    color="primary.main"
                  >
                    {imageIcon}
                  </Box>
                )}
              </Box>
            </Grid>
          )}

          <Grid item xs container className={classes.headerContent}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              width="100%"
            >
              <Box>
                {title && (
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    style={{ fontWeight: 'bold' }}
                  >
                    {title}
                  </Typography>
                )}
              </Box>
              {actions && <Box>{actions}</Box>}
            </Box>

            {description && (
              <Box className={classes.description}>
                <MarkdownRenderer content={description} />
              </Box>
            )}

            {tagsAndEntities &&
              (tagsAndEntities.entity ||
                (tagsAndEntities.tags && tagsAndEntities.tags.length > 0) ||
                (tagsAndEntities.entities &&
                  tagsAndEntities.entities.length > 0)) && (
                <Box mb={2}>
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
              <Box className={classes.statsRow}>
                {stats.map((stat, index) => (
                  <Tooltip key={index} title={stat.label}>
                    <Box className={classes.statItem}>
                      <Typography className={classes.statValue} color="primary">
                        {stat.icon} {stat.value}
                      </Typography>
                      <Typography className={classes.statLabel}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            )}
            {children && <Box mt={2}>{children}</Box>}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
