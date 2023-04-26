/* eslint-disable no-console */
import React from 'react';
import ReactMde from 'react-mde';

import { Config } from '@backstage/config';
import { MarkdownContent } from '@backstage/core-components';
import 'react-mde/lib/styles/css/react-mde.css';
import 'react-mde/lib/styles/css/react-mde-editor.css';
import 'react-mde/lib/styles/css/react-mde-toolbar.css';
import { useStyles } from '../../utils/hooks';
import FileType from 'file-type';
import { ErrorApi, errorApiRef, useApi } from '@backstage/core-plugin-api';

const DEFAULT_IMAGE_SIZE_LIMIT = 2500000;
const SUPPORTED_FILES_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

export const submitImage = async (
  config: Config,
  file: Blob,
  erroAlert: ErrorApi,
) => {
  const backendBaseUrl = config.getString('backend.baseUrl');
  const qetaUrl = `${backendBaseUrl}/api/qeta/attachments`;
  const formData = new FormData();

  formData.append('image', file);

  const requestOptions = {
    method: 'POST',
    body: formData,
  };

  const response = await fetch(qetaUrl, requestOptions);

  if (response.status >= 400) {
    const responseError = await response.text();
    const error = new Error(
      `Failed to upload image question : ${responseError}`,
    );
    erroAlert.post(error);
    throw new Error(`Failed to upload image question : ${responseError}`);
  }
  return response.json();
};

const imageUpload = (config: Config, erroAlert: ErrorApi) => {
  const maxSizeImage =
    config?.getOptionalNumber('qeta.storage.maxSizeImage') ||
    DEFAULT_IMAGE_SIZE_LIMIT;

  // eslint-disable-next-line func-names
  return async function* (data: ArrayBuffer) {
    const fileType = await FileType.fromBuffer(data);

    if (fileType && !SUPPORTED_FILES_TYPES.includes(fileType?.mime)) {
      erroAlert.post(new Error(`Image type (${fileType.mime}) not supported.`));
      return false;
    }

    if (data.byteLength > maxSizeImage) {
      erroAlert.post(
        new Error(
          `Image larger than ${maxSizeImage} bytes try to make it smaller before uploading.`,
        ),
      );
      return false;
    }
    const { locationUri } = await submitImage(
      config,
      new Blob([data], { type: 'text/plain' }),
      erroAlert,
    );

    yield locationUri;

    return true;
  };
};

export const MarkdownEditor = (props: {
  config: Config;
  value: string;
  onChange: (value: string) => void;
  height: number;
  error?: boolean;
  placeholder?: string;
}) => {
  const { config, value, onChange, height, error, placeholder } = props;
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'write',
  );
  const styles = useStyles();
  const errorApi = useApi(errorApiRef);

  const isUploadDisabled =
    config?.getOptionalBoolean('qeta.storage.disabled') || false;

  return (
    <ReactMde
      classes={{
        reactMde: styles.markdownEditor,
        textArea: error ? styles.markdownEditorError : undefined,
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
          <MarkdownContent
            content={content}
            dialect="gfm"
            className={styles.markdownContent}
          />,
        )
      }
      paste={
        isUploadDisabled
          ? undefined
          : {
              saveImage: imageUpload(config, errorApi),
            }
      }
    />
  );
};
