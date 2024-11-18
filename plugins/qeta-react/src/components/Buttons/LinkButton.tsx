import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/icons-material/Link';
import React from 'react';
import {
  AnswerResponse,
  PostResponse,
} from '@drodil/backstage-plugin-qeta-common';
import { useTranslation } from '../../hooks';

export const LinkButton = (props: {
  entity: PostResponse | AnswerResponse;
  className?: string;
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
