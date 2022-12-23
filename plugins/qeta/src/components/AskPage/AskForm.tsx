import { WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { useNavigate } from 'react-router-dom';
import { qetaApiRef, QuestionRequest } from '../../api';
import { useStyles } from '../../utils/hooks';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';

export const AskForm = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState(false);
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const qetaApi = useApi(qetaApiRef);
  const styles = useStyles();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionRequest>();

  const postQuestion = (data: QuestionRequest) => {
    qetaApi
      .postQuestion(data)
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
        reset();
        navigate(`/qeta/questions/${q.id}`);
      })
      .catch(_e => setError(true));
  };

  useEffect(() => {
    qetaApi.getTags().then(data => setAvailableTags(data));
  }, [qetaApi]);

  return (
    <form onSubmit={handleSubmit(postQuestion)}>
      {error && (
        <WarningPanel severity="error" title="Could not post question" />
      )}
      <TextField
        label="Title"
        required
        fullWidth
        error={'title' in errors}
        margin="normal"
        variant="outlined"
        helperText="Write good title for your question that people can understand"
        {...register('title', { required: true, maxLength: 255 })}
      />
      <Controller
        control={control}
        defaultValue=""
        rules={{
          required: true,
        }}
        render={({ field: { onChange, value } }) => (
          <MarkdownEditor
            value={value}
            onChange={onChange}
            height={400}
            error={'content' in errors}
            placeholder="Your question"
          />
        )}
        name="content"
      />
      <Controller
        control={control}
        defaultValue={[]}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            multiple
            id="tags-standard"
            value={value}
            options={availableTags}
            freeSolo
            onChange={(_e, newValue) => {
              if (!value || value.length < 5) {
                onChange(newValue);
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                margin="normal"
                label="Tags"
                placeholder="Type or select tags"
                helperText="Add up to 5 tags to categorize your question"
              />
            )}
          />
        )}
        name="tags"
      />
      <Button type="submit" variant="contained" className={styles.postButton}>
        Post
      </Button>
    </form>
  );
};
