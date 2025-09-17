import { LinkButton } from '@backstage/core-components';
import HelpOutline from '@material-ui/icons/HelpOutline';
import { useRouteRef } from '@backstage/core-plugin-api';
import {
  askRouteRef,
  createLinkRouteRef,
  writeRouteRef
} from '../../routes';
import { PostType, selectByPostType } from '@drodil/backstage-plugin-qeta-common';
import CreateIcon from '@material-ui/icons/Create';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { useEntityQueryParameter } from '../../hooks/useEntityQueryParameter';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import LinkIcon from "@material-ui/icons/Link";

export const NoPostsCard = (props: {
  showNoPostsBtn?: boolean;
  entity?: string;
  entityPage?: boolean;
  tags?: string[];
  type?: PostType;
}) => {
  const { showNoPostsBtn, entity, entityPage, tags, type } = props;
  const askRoute = useRouteRef(askRouteRef);
  const writeRoute = useRouteRef(writeRouteRef);
  const linkRoute = useRouteRef(createLinkRouteRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const entityRef = useEntityQueryParameter(entity) ?? entity;

  const queryParams = new URLSearchParams();
  if (entityRef) {
    queryParams.set('entity', entityRef);
  }
  if (entityPage) {
    queryParams.set('entityPage', 'true');
  }
  if (tags && tags.length > 0) {
    queryParams.set('tags', tags.join(','));
  }

  const route = selectByPostType(
    type ?? 'question', askRoute, writeRoute, linkRoute
  )

  const itemType = t(`common.${type ?? 'post'}`, {});
  return (
    <Card style={{ marginTop: '2em' }}>
      <CardContent>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <Grid item>
            <Typography variant="h6">
              {t('postsContainer.noItems', {
                itemType,
              })}
            </Typography>
          </Grid>
          {showNoPostsBtn && (
            <Grid item>
              <LinkButton
                to={
                  queryParams.size > 0
                    ? `${route()}?${queryParams.toString()}`
                    : `${route()}`
                }
                startIcon={
                  selectByPostType(
                    type ?? 'question',
                    <HelpOutline />,
                    <CreateIcon />,
                    <LinkIcon />
                  )
                }
                color="primary"
                variant="outlined"
              >
                {t('postsContainer.createButton')}
              </LinkButton>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
