import { RiEditLine } from '@remixicon/react';
import { Button, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  Article,
  Collection,
  isArticle,
  isLink,
  isPost,
  isQuestion,
  Link,
  Question,
} from '@drodil/backstage-plugin-qeta-common';
import { useNavigate } from 'react-router-dom';
import {
  collectionEditRouteRef,
  editArticleRouteRef,
  editLinkRouteRef,
  editQuestionRouteRef,
} from '../../routes.ts';
import { useRouteRef } from '@backstage/core-plugin-api';

export const EditButton = (props: {
  entity: Question | Article | Link | Collection;
  compact?: boolean;
}) => {
  const { entity, compact } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const navigate = useNavigate();
  let routeRef = undefined;
  if (isQuestion(entity)) {
    routeRef = editQuestionRouteRef;
  } else if (isArticle(entity)) {
    routeRef = editArticleRouteRef;
  } else if (isLink(entity)) {
    routeRef = editLinkRouteRef;
  } else {
    routeRef = collectionEditRouteRef;
  }
  const route = useRouteRef(routeRef);
  const onClick = () => {
    navigate(
      route({
        id: entity.id.toString(10),
      }),
    );
  };

  if (!entity.canEdit || (isPost(entity) && entity.status === 'obsolete')) {
    return null;
  }

  if (compact) {
    return (
      <TooltipTrigger>
        <ButtonIcon
          icon={<RiEditLine size={16} />}
          variant="secondary"
          aria-label={t('common.edit')}
          onClick={onClick}
        />
        <Tooltip>{t('common.edit')}</Tooltip>
      </TooltipTrigger>
    );
  }

  return (
    <Button
      variant="secondary"
      size="small"
      iconStart={<RiEditLine size={16} />}
      onClick={onClick}
    >
      {t('common.edit')}
    </Button>
  );
};
