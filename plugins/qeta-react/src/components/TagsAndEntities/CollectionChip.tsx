import { useRouteRef } from '@backstage/core-plugin-api';
import { collectionRouteRef } from '../../routes';
import { Collection } from '@drodil/backstage-plugin-qeta-common';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@material-ui/core';
import { CollectionTooltip } from '../Tooltips';

export const CollectionChip = (props: { collection: Collection }) => {
  const collectionRoute = useRouteRef(collectionRouteRef);
  const navigate = useNavigate();
  const { collection } = props;
  return (
    <CollectionTooltip collectionId={collection.id} arrow enterDelay={400}>
      <Chip
        label={collection.title}
        size="small"
        className="qetaCollectionChip"
        component="a"
        onClick={() => {
          navigate(collectionRoute({ id: collection.id.toString(10) }));
        }}
        clickable
      />
    </CollectionTooltip>
  );
};
