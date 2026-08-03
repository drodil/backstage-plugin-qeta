import {
  Template,
  TemplatesResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  List,
  ListRow,
} from '@backstage/ui';

export const SelectTemplateList = (props: {
  templates: TemplatesResponse;
  onTemplateSelect: (template: Template | null) => void;
}) => {
  const { templates, onTemplateSelect } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  if (templates.total === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>{t('templateSelectList.title')}</CardHeader>
      <CardBody>
        <List>
          {templates.templates.map(template => (
            <ListRow
              key={template.id}
              description={template.description}
              customActions={
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onTemplateSelect(template)}
                >
                  {t('templateSelectList.selectButton')}
                </Button>
              }
            >
              {template.title}
            </ListRow>
          ))}
          <ListRow
            description={t('templateSelectList.genericQuestionDescription')}
            customActions={
              <Button
                variant="secondary"
                size="small"
                onClick={() => onTemplateSelect(null)}
              >
                {t('templateSelectList.selectButton')}
              </Button>
            }
          >
            {t('templateSelectList.genericQuestion')}
          </ListRow>
        </List>
      </CardBody>
    </Card>
  );
};
