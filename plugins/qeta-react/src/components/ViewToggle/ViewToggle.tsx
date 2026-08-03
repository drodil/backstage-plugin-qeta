import { ToggleButton, ToggleButtonGroup } from '@backstage/ui';
import { RiLayoutGridLine, RiListUnordered } from '@remixicon/react';
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
    <ToggleButtonGroup
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[view]}
      onSelectionChange={keys => {
        const key = Array.from(keys)[0];
        if (key) {
          onChange(key as ViewType);
        }
      }}
    >
      <ToggleButton
        id="list"
        size="small"
        aria-label={t('viewToggle.listView')}
        iconStart={<RiListUnordered size={16} />}
      />
      <ToggleButton
        id="grid"
        size="small"
        aria-label={t('viewToggle.gridView')}
        iconStart={<RiLayoutGridLine size={16} />}
      />
    </ToggleButtonGroup>
  );
};
