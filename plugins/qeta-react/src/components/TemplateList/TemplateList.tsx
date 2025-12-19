import { useIsModerator, useQetaApi } from '../../hooks';
import { Progress, WarningPanel } from '@backstage/core-components';
import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import EditIcon from '@material-ui/icons/Edit';
import { qetaApiRef } from '../../api';
import DeleteIcon from '@material-ui/icons/Delete';
import { TemplateForm } from './TemplateForm';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-use';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

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
    return <Progress />;
  }

  if (error || value === undefined) {
    return (
      <WarningPanel severity="error" title={t('templateList.errorLoading')}>
        {error?.message}
      </WarningPanel>
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
        variant="contained"
        color="primary"
        onClick={() => {
          navigate('#template:new');
        }}
      >
        Create New Template
      </Button>
      <Box
        sx={{ width: '100%', bgcolor: 'background.paper', marginTop: '1em' }}
      >
        <List style={{ width: '100%' }}>
          {value.total === 0 && (
            <ListItem>
              <ListItemText
                primary={t('templateList.noTemplates')}
                secondary={t('templateList.noTemplatesDescription')}
              />
            </ListItem>
          )}
          {value.templates.map((template, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={template.title}
                secondary={template.description}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => {
                    navigate(`#template:${template.id}`);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(template.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
};
