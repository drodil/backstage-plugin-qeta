import { Button, Grid, TextField, Typography } from '@material-ui/core';
import { imageUpload } from '../../utils/utils';
import React from 'react';
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useTranslation } from '../../utils';
import { qetaApiRef } from '../../api';
import { useFormStyles } from '../../utils/hooks';

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
  const { t } = useTranslation();
  const styles = useFormStyles();

  const isUploadDisabled =
    configApi.getOptionalBoolean('qeta.storage.disabled') || false;

  return (
    <Grid container alignItems="center">
      <Grid item xs={isUploadDisabled ? 12 : 10}>
        <TextField
          value={url ?? ''}
          fullWidth
          label={t('fileInput.label')}
          placeholder="https://"
          margin="normal"
          variant="outlined"
          onChange={e => onChange(e.target.value)}
          helperText={t('fileInput.helperText')}
        />
      </Grid>
      {!isUploadDisabled && (
        <Grid item xs={2}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="headerImage"
            type="file"
            onChange={async event => {
              if (!event.target.files || event.target.files.length === 0) {
                return;
              }
              const buffer = await event.target.files[0].arrayBuffer();

              const uri = await imageUpload({
                qetaApi,
                errorApi,
                onImageUpload,
                postId,
                collectionId,
              })(buffer).next();
              if (typeof uri.value === 'string') {
                onChange(uri.value);
              }
            }}
          />
          <label htmlFor="headerImage">
            <Button variant="contained" color="primary" component="span">
              {t('fileInput.uploadHeaderImage')}
            </Button>
          </label>
        </Grid>
      )}
      {url && (
        <Grid item xs={12}>
          <Typography variant="subtitle1">{t('fileInput.preview')}</Typography>
          <img className={styles.headerImage} src={url} alt="header" />
        </Grid>
      )}
    </Grid>
  );
};
