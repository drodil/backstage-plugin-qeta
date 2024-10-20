import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@material-ui/icons/Link';
import React from 'react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../utils';

export const LinkButton = (props: {
  entity: PostResponse | AnswerResponse;
}) => {
  const isQuestion = 'title' in props.entity;
  const { t } = useTranslation();
  const copyToClipboard = () => {
    const url = new URL(window.location.href);
    if (!isQuestion) {
      url.hash = `#answer_${props.entity.id}`;
    }
    window.navigator.clipboard.writeText(url.toString());
  };

  return (
    <Tooltip title={isQuestion ? t('link.question') : t('link.answer')}>
      <IconButton
        aria-label={t('link.aria')}
        size="small"
        onClick={copyToClipboard}
      >
        <Link />
      </IconButton>
    </Tooltip>
  );
};
