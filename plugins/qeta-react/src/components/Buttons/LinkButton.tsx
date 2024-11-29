import React from 'react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../hooks';
import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@material-ui/icons/Link';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';

export const LinkButton = (props: {
  entity: PostResponse | AnswerResponse;
  className?: string;
}) => {
  const isQuestion = 'title' in props.entity;
  const { t } = useTranslation();
  const alertApi = useApi(alertApiRef);
  const copyToClipboard = () => {
    const url = new URL(window.location.href);
    if (!isQuestion) {
      url.hash = `#answer_${props.entity.id}`;
    }
    window.navigator.clipboard.writeText(url.toString());
    alertApi.post({
      message: t('link.copied'),
      severity: 'info',
      display: 'transient',
    });
  };

  return (
    <Tooltip title={isQuestion ? t('link.post') : t('link.answer')}>
      <IconButton
        aria-label={t('link.aria')}
        size="small"
        onClick={copyToClipboard}
        className={props.className}
      >
        <Link />
      </IconButton>
    </Tooltip>
  );
};
