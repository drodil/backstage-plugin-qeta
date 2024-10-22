/* eslint-disable no-console */
import React from 'react';
import ReactMde from 'react-mde';

import { Config } from '@backstage/config';
import 'react-mde/lib/styles/css/react-mde.css';
import 'react-mde/lib/styles/css/react-mde-editor.css';
import 'react-mde/lib/styles/css/react-mde-toolbar.css';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { imageUpload } from '../../utils/utils';
import { makeStyles } from '@material-ui/core';

export type QetaMarkdownEditorClassKey =
  | 'markdownEditor'
  | 'markdownEditorError'
  | 'markdownPreview';

export const useStyles = makeStyles(
  theme => {
    return {
      markdownEditor: {
        backgroundColor: 'initial',
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.action.disabled}`,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          borderColor: theme.palette.action.active,
        },
        '&:focus-within': {
          borderColor: theme.palette.primary.main,
        },
        '& .mde-header': {
          backgroundColor: 'initial',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.action.selected}`,
          '& .mde-tabs button, .mde-header-item > button': {
            color: `${theme.palette.text.primary} !important`,
          },
        },
        '& .mde-preview-content': {
          padding: '10px',
        },
        '& .mde-text, .mde-preview': {
          fontSize: theme.typography.body1.fontSize,
          fontFamily: theme.typography.body1.fontFamily,
          lineHeight: theme.typography.body1.lineHeight,
        },
        '& .mde-text': {
          backgroundColor: 'initial',
          color: theme.palette.text.primary,
          outline: 'none',
        },
        '& .image-tip': {
          color: theme.palette.text.primary,
          backgroundColor: 'initial',
        },
      },
      markdownEditorError: {
        border: `1px solid ${theme.palette.error.main} !important`,
      },
      markdownPreview: {
        '& *': {
          wordBreak: 'break-word',
        },
        '&.inline': {
          display: 'inline-block',
        },
        '& > :first-child': {
          marginTop: '0px !important',
        },
        '& > :last-child': {
          marginBottom: '0px !important',
        },
      },
    };
  },
  { name: 'QetaMarkdownEditor' },
);

export const MarkdownEditor = (props: {
  config: Config;
  value: string;
  onChange: (value: string) => void;
  height: number;
  error?: boolean;
  placeholder?: string;
  onImageUpload: (imageId: number) => void;
}) => {
  const { config, value, onChange, height, error, placeholder } = props;
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'write',
  );
  const styles = useStyles();
  const errorApi = useApi(errorApiRef);
  const qetaApi = useApi(qetaApiRef);

  const isUploadDisabled =
    config?.getOptionalBoolean('qeta.storage.disabled') || false;

  return (
    <ReactMde
      classes={{
        reactMde: `qetaMarkdownEditorEdit ${styles.markdownEditor}`,
        textArea: error
          ? `qetaMarkdownEditorError ${styles.markdownEditorError}`
          : undefined,
        preview: 'qetaMarkdownEditorPreview',
        toolbar: 'qetaMarkdownEditorToolbar',
      }}
      value={value}
      onChange={onChange}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      minEditorHeight={height}
      minPreviewHeight={height - 10}
      childProps={{
        textArea: {
          required: true,
          placeholder,
        },
      }}
      generateMarkdownPreview={content =>
        Promise.resolve(
          <MarkdownRenderer
            content={content}
            className={`qetaMarkdownEditorPreview ${styles.markdownPreview}`}
          />,
        )
      }
      paste={
        isUploadDisabled
          ? undefined
          : {
              saveImage: imageUpload({
                qetaApi,
                errorApi,
                onImageUpload: props.onImageUpload,
              }),
            }
      }
    />
  );
};
