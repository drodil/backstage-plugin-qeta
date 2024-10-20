/* eslint-disable no-console */
import React from 'react';
import ReactMde from 'react-mde';

import { Config } from '@backstage/config';
import 'react-mde/lib/styles/css/react-mde.css';
import 'react-mde/lib/styles/css/react-mde-editor.css';
import 'react-mde/lib/styles/css/react-mde-toolbar.css';
import { useStyles } from '../../utils';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { imageUpload } from '../../utils/utils';

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
            className={`qetaMarkdownEditorPreview ${styles.markdownContent}`}
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
