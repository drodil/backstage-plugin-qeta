import { IconButton, Tooltip } from '@material-ui/core';
import Link from '@material-ui/icons/Link';
import React from 'react';
import {
  AnswerResponse,
  QuestionResponse,
} from '@drodil/backstage-plugin-qeta-common';

export const LinkButton = (props: {
  entity: QuestionResponse | AnswerResponse;
}) => {
  const isQuestion = 'title' in props.entity;
  const copyToClipboard = () => {
    const url = new URL(window.location.href);
    if (!isQuestion) {
      url.hash = `#answer_${props.entity.id}`;
    }
    window.navigator.clipboard.writeText(url.toString());
  };

  return (
    <Tooltip
      title={`Copy link to this ${
        isQuestion ? 'question' : 'answer'
      } to clipboard`}
    >
      <IconButton
        aria-label="copy link to clipboard"
        size="small"
        onClick={copyToClipboard}
      >
        <Link />
      </IconButton>
    </Tooltip>
  );
};
