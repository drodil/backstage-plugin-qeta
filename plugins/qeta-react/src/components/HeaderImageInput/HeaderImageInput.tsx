import { imageUpload } from '../../utils/utils';
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Box,
  IconButton,
  InputAdornment,
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloseIcon from '@material-ui/icons/Close';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles(theme => ({
  headerImage: {
    marginBottom: '1rem',
    height: '250px',
    objectFit: 'cover',
    width: '100%',
    border: `1px solid ${theme.palette.background.paper}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
  dropzone: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s ease-in-out',
    margin: '0 auto',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  dropzoneActive: {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.action.selected,
  },
  uploadIcon: {
    fontSize: 36,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  previewContainer: {
    position: 'relative',
    marginTop: theme.spacing(1),
    margin: '0 auto',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.shape.borderRadius,
  },
  previewLabel: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  imageErrorBox: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.error.main,
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#fff3f3',
    marginTop: theme.spacing(1),
  },
}));

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
  const styles = useStyles();
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [inputValue, setInputValue] = useState(url ?? '');
  const [debouncedValue, setDebouncedValue] = useState(url ?? '');

  const isUploadDisabled =
    configApi.getOptionalBoolean('qeta.storage.disabled') || false;

  const allowedMimeTypes = configApi.getOptionalStringArray(
    'qeta.storage.allowedMimeTypes',
  ) || ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

  const acceptObj = allowedMimeTypes.reduce((acc, type) => {
    if (!type.includes('image/')) {
      return acc;
    }
    acc[type] = [];
    return acc;
  }, {} as Record<string, string[]>);

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
    <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
      <Grid item xs={12}>
        <TextField
          value={inputValue}
          fullWidth
          label={t('fileInput.label')}
          placeholder="https://"
          margin="normal"
          variant="outlined"
          onChange={e => {
            setInputValue(e.target.value);
          }}
          helperText={t('fileInput.helperText')}
          FormHelperTextProps={{
            style: { marginLeft: '0.2em' },
          }}
          InputProps={{
            endAdornment: url && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear image url"
                  onClick={handleClearUrl}
                  edge="end"
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      {!isUploadDisabled && !url && (
        <Grid item xs={12}>
          <Paper
            {...getRootProps()}
            className={`${styles.dropzone} ${
              isDragActive ? styles.dropzoneActive : ''
            }`}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon className={styles.uploadIcon} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? t('fileInput.dropHere')
                : t('fileInput.dragAndDrop')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('fileInput.supportedFormats', {
                formats: allowedMimeTypes.join(', '),
              })}
            </Typography>
            <Box mt={2}>
              <Button variant="contained" color="primary">
                {t('fileInput.selectFile')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      )}
      {debouncedValue && (
        <Grid item xs={12}>
          <div className={styles.previewContainer}>
            <Typography variant="subtitle2" className={styles.previewLabel}>
              {t('fileInput.preview')}
            </Typography>
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
                <CircularProgress />
              </div>
            )}
          </div>
        </Grid>
      )}
    </Grid>
  );
};
