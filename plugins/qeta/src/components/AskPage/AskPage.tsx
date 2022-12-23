import {
  Content,
  ContentHeader,
  InfoCard,
  WarningPanel,
} from '@backstage/core-components';
import { Button, Grid, TextField } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef, QuestionRequest } from '../../api';
import { useNavigate } from 'react-router';
import { Autocomplete } from '@material-ui/lab';
import { useStyles } from '../../utils/hooks';
import { Controller, useForm } from 'react-hook-form';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';

export const AskPage = () => {
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
    <Content>
      <ContentHeader title="Ask question" />
      <Grid container spacing={3} direction="column">
        {error && (
          <WarningPanel severity="error" title="Could not post question" />
        )}
        <Grid item>
          <InfoCard>
            <form onSubmit={handleSubmit(postQuestion)}>
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
              <Button
                type="submit"
                variant="contained"
                className={styles.postButton}
              >
                Post
              </Button>
            </form>
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
