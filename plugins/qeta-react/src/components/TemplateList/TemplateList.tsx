import { useIsModerator, useQetaApi } from '../../hooks';
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { RiDeleteBinLine, RiEditLine } from '@remixicon/react';
import { qetaApiRef } from '../../api';
import { TemplateForm } from './TemplateForm';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-use';
import { Alert, Box, Button, List, ListRow, MenuItem } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { LoadingGrid } from '../LoadingGrid/LoadingGrid';
import styles from './TemplateList.module.css';

export const TemplateList = () => {
  const { isModerator } = useIsModerator();

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [id, setId] = useState<number | undefined>(undefined);
  const qetaApi = useApi(qetaApiRef);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { value, loading, error, retry } = useQetaApi(api =>
    api.getTemplates(),
  );
  const { t } = useTranslationRef(qetaTranslationRef);

  useEffect(() => {
    const [, hashMode] = (hash ?? '').split(':');
    if (hashMode === 'new') {
      setMode('create');
    } else {
      const hashId = parseInt(hashMode, 10);
      if (!isNaN(hashId)) {
        setId(hashId);
        setMode('edit');
      } else {
        setMode('list');
      }
    }
  }, [hash]);

  if (!isModerator) {
    return null;
  }

  const onDelete = (templateId: number) => {
    qetaApi.deleteTemplate(templateId).then(() => retry());
  };

  if (loading) {
    return <LoadingGrid />;
  }

  if (error || value === undefined) {
    return (
      <Alert
        status="danger"
        title={t('templateList.errorLoading')}
        description={error?.message}
      />
    );
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <TemplateForm
        onPost={() => {
          retry();
          navigate('#template:list');
        }}
        id={id}
      />
    );
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => {
          navigate('#template:new');
        }}
      >
        Create New Template
      </Button>
      <Box className={styles.root}>
        <List>
          {value.total === 0 && (
            <ListRow description={t('templateList.noTemplatesDescription')}>
              {t('templateList.noTemplates')}
            </ListRow>
          )}
          {value.templates.map(template => (
            <ListRow
              key={template.id}
              description={template.description}
              menuItems={
                <>
                  <MenuItem
                    iconStart={<RiEditLine size={16} />}
                    onAction={() => navigate(`#template:${template.id}`)}
                  >
                    {t('templateList.editButton')}
                  </MenuItem>
                  <MenuItem
                    iconStart={<RiDeleteBinLine size={16} />}
                    color="danger"
                    onAction={() => onDelete(template.id)}
                  >
                    {t('templateList.deleteButton')}
                  </MenuItem>
                </>
              }
            >
              {template.title}
            </ListRow>
          ))}
        </List>
      </Box>
    </>
  );
};
