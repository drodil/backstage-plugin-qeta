import { imageUpload } from '../../utils/utils';
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import { Box, Button, ButtonIcon, Flex, Text, TextField } from '@backstage/ui';
import { RiCloseLine, RiUploadCloud2Line } from '@remixicon/react';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './HeaderImageInput.module.css';

export const HeaderImageInput = (props: {
  url?: string;
  onChange: (url?: string) => void;
  onImageUpload: (imageId: number) => void;
  postId?: number;
  collectionId?: number;
}) => {
  const { url, onChange, onImageUpload, postId, collectionId } = props;
  const configApi = useApi(configApiRef);
  const qetaApi = useApi(qetaApiRef);
  const errorApi = useApi(errorApiRef);
  const { t } = useTranslationRef(qetaTranslationRef);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [inputValue, setInputValue] = useState(url ?? '');
  const [debouncedValue, setDebouncedValue] = useState(url ?? '');

  const isUploadDisabled =
    configApi.getOptionalBoolean('qeta.storage.disabled') || false;

  const allowedMimeTypes = configApi.getOptionalStringArray(
    'qeta.storage.allowedMimeTypes',
  ) || ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

  const acceptObj = allowedMimeTypes.reduce(
    (acc, type) => {
      if (!type.includes('image/')) {
        return acc;
      }
      acc[type] = [];
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const handleClearUrl = () => {
    setInputValue('');
    setDebouncedValue('');
    onChange(undefined);
    setImageError(false);
  };

  useEffect(() => {
    setInputValue(url ?? '');
  }, [url]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
      if (inputValue !== url && !(inputValue === '' && url === undefined)) {
        onChange(inputValue);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [inputValue, onChange, url]);

  useEffect(() => {
    setImageError(false);
  }, [debouncedValue]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      try {
        setIsUploading(true);
        const buffer = await acceptedFiles[0].arrayBuffer();
        const uri = await imageUpload({
          qetaApi,
          errorApi,
          onImageUpload,
          postId,
          collectionId,
        })(buffer).next();
        if (typeof uri.value === 'string') {
          setInputValue(uri.value);
        }
      } catch (error) {
        errorApi.post(error);
      } finally {
        setIsUploading(false);
      }
    },
    [qetaApi, errorApi, onImageUpload, postId, collectionId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptObj,
    maxFiles: 1,
    disabled: isUploadDisabled,
  });

  if (Object.keys(acceptObj).length === 0) {
    return null;
  }

  return (
    <Flex direction="column" gap="4" className={styles.container}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGrow}>
          <TextField
            value={inputValue}
            label={t('fileInput.label')}
            placeholder="https://"
            description={t('fileInput.helperText')}
            onChange={value => setInputValue(value)}
          />
        </div>
        {url && (
          <ButtonIcon
            aria-label="clear image url"
            icon={<RiCloseLine />}
            onPress={handleClearUrl}
            variant="secondary"
          />
        )}
      </div>
      {!isUploadDisabled && !url && (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${
            isDragActive ? styles.dropzoneActive : ''
          }`}
        >
          <input {...getInputProps()} />
          <Flex direction="column" gap="2">
            <Flex gap="1" justify="center">
              <RiUploadCloud2Line size={24} className={styles.uploadIcon} />
              <Text variant="title-x-small">
                {isDragActive
                  ? t('fileInput.dropHere')
                  : t('fileInput.dragAndDrop')}
              </Text>
            </Flex>
            <Text variant="body-small" color="secondary">
              {t('fileInput.supportedFormats', {
                formats: allowedMimeTypes.join(', '),
              })}
            </Text>
            <Box className={styles.selectFileButton}>
              <Button variant="primary">{t('fileInput.selectFile')}</Button>
            </Box>
          </Flex>
        </div>
      )}
      {debouncedValue && (
        <div className={styles.previewContainer}>
          <Text variant="body-small" className={styles.previewLabel}>
            {t('fileInput.preview')}
          </Text>
          {imageError ? (
            <div className={styles.imageErrorBox}>
              {t('fileInput.imageLoadError')}
            </div>
          ) : (
            <img
              className={styles.headerImage}
              src={debouncedValue}
              alt="header"
              onError={() => setImageError(true)}
            />
          )}
          {isUploading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
            </div>
          )}
        </div>
      )}
    </Flex>
  );
};
