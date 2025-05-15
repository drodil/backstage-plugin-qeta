import { imageUpload } from '../../utils/utils';
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useTranslation } from '../../hooks';
import {
  Button,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  headerImage: {
    marginBottom: '1rem',
    marginTop: '1rem',
    height: '250px',
    objectFit: 'cover',
    width: '100%',
    border: `1px solid ${theme.palette.background.paper}`,
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
  const { t } = useTranslation();
  const styles = useStyles();

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
          FormHelperTextProps={{
            style: { marginLeft: '0.2em' },
          }}
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
