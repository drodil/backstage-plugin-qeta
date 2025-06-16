import { Button, ButtonGroup, Tooltip } from '@material-ui/core';
import ViewList from '@material-ui/icons/ViewList';
import ViewModule from '@material-ui/icons/ViewModule';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export type ViewType = 'list' | 'grid';

interface ViewToggleProps {
  view: ViewType;
  onChange: (view: ViewType) => void;
}

export const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  const { t } = useTranslationRef(qetaTranslationRef);

  return (
    <ButtonGroup size="small">
      <Tooltip title={t('viewToggle.listView')}>
        <Button
          color={view === 'list' ? 'primary' : undefined}
          onClick={() => onChange('list')}
          aria-label={t('viewToggle.listView')}
        >
          <ViewList />
        </Button>
      </Tooltip>
      <Tooltip title={t('viewToggle.gridView')}>
        <Button
          color={view === 'grid' ? 'primary' : undefined}
          onClick={() => onChange('grid')}
          aria-label={t('viewToggle.gridView')}
        >
          <ViewModule />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};
