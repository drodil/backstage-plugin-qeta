import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { InfoCard } from '@backstage/core-components';
import { CardContent, CardMedia, Grid } from '@material-ui/core';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { TagsAndEntities } from '../TagsAndEntities/TagsAndEntities';

export const CollectionCard = (props: { collection: Collection }) => {
  const { collection } = props;
  return (
    <InfoCard>
      {collection.headerImage && (
        <CardMedia
          component="img"
          height="150"
          onError={e => (e.currentTarget.style.display = 'none')}
          src={collection.headerImage}
          alt={collection.title}
        />
      )}
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            {collection.description && (
              <MarkdownRenderer content={collection.description} />
            )}
          </Grid>
          <Grid item xs={12}>
            <TagsAndEntities entity={collection} />
          </Grid>
        </Grid>
      </CardContent>
    </InfoCard>
  );
};
