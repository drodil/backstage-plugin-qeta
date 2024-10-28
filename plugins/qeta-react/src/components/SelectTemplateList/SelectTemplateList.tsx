import {
  Template,
  TemplatesResponse,
} from '@drodil/backstage-plugin-qeta-common';
import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core';
import { useTranslation } from '../../hooks';

export const SelectTemplateList = (props: {
  templates: TemplatesResponse;
  onTemplateSelect: (template: Template | null) => void;
}) => {
  const { templates, onTemplateSelect } = props;
  const { t } = useTranslation();
  if (templates.total === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader title={t('templateSelectList.title')} />
      <CardContent>
        <List style={{ width: '100%' }}>
          {templates.templates.map((template, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={template.title}
                secondary={template.description}
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => onTemplateSelect(template)}
                >
                  {t('templateSelectList.selectButton')}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          <ListItem>
            <ListItemText
              primary={t('templateSelectList.genericQuestion')}
              secondary={t('templateSelectList.genericQuestionDescription')}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onTemplateSelect(null)}
              >
                {t('templateSelectList.selectButton')}
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};