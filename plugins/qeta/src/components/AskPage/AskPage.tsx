import {
  Content,
  ContentHeader,
  InfoCard,
  WarningPanel,
} from '@backstage/core-components';
import { Button, Grid, TextField } from '@material-ui/core';
import MDEditor from '@uiw/react-md-editor';
import React, { useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Autocomplete } from '@material-ui/lab';

export const AskPage = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const qetaApi = useApi(qetaApiRef);

  const postQuestion = () => {
    qetaApi
      .postQuestion({ title, content: question, tags })
      .then(q => {
        if (!q || !q.id) {
          setError(true);
          return;
        }
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
            <form>
              <TextField
                label="Title"
                required
                fullWidth
                margin="normal"
                title={title}
                onChange={e => setTitle(e.target.value)}
                variant="outlined"
                helperText="Write good title for your question that people can understand"
              />
              <MDEditor
                value={question}
                onChange={v => setQuestion(v as string)}
                preview="edit"
                height={400}
              />
              <Autocomplete
                multiple
                id="tags-standard"
                options={availableTags}
                defaultValue={tags}
                onChange={(_e, inputTags) => {
                  if (inputTags.length < 5) {
                    setTags(inputTags);
                  }
                }}
                freeSolo
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
              <Button variant="contained" onClick={postQuestion}>
                Post
              </Button>
            </form>
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
