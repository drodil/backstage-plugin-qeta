import { WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { useNavigate } from 'react-router-dom';
import { qetaApiRef } from '../../api';
import { useStyles } from '../../utils/hooks';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { getEntityTitle } from '../../utils/utils';

interface QuestionForm {
  title: string;
  content: string;
  tags?: string[];
  components?: Entity[];
}

const formToRequest = (form: QuestionForm) => {
  return {
    ...form,
    components: form.components?.map(stringifyEntityRef),
  };
};

export const AskForm = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState(false);
  const [availableTags, setAvailableTags] = React.useState<string[] | null>([]);
  const [availableComponents, setAvailableComponents] = React.useState<
    Entity[] | null
  >([]);
  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const styles = useStyles();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<QuestionForm>();

  const postQuestion = (data: QuestionForm) => {
    qetaApi
      .postQuestion(formToRequest(data))
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
    qetaApi
      .getTags()
      .catch(_ => setAvailableTags(null))
      .then(data =>
        data
          ? setAvailableTags(data.map(tag => tag.tag))
          : setAvailableTags(null),
      );
  }, [qetaApi]);

  useEffect(() => {
    catalogApi
      .getEntities()
      .catch(_ => setAvailableComponents(null))
      .then(data =>
        data
          ? setAvailableComponents(data.items)
          : setAvailableComponents(null),
      );
  }, [catalogApi]);

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
        {
          // @ts-ignore
          ...register('title', { required: true, maxLength: 255 })
        }
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
      {availableTags && (
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
      )}
      {availableComponents && (
        <Controller
          control={control}
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              multiple
              id="tags-standard"
              options={availableComponents}
              getOptionLabel={getEntityTitle}
              getOptionSelected={(o, v) =>
                stringifyEntityRef(o) === stringifyEntityRef(v)
              }
              onChange={(_e, newValue) => {
                if (!value || value.length < 3) {
                  onChange(newValue);
                }
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  margin="normal"
                  label="Components"
                  placeholder="Type or select components"
                  helperText="Add up to 3 components this question relates to"
                />
              )}
            />
          )}
          name="components"
        />
      )}
      <Button type="submit" variant="contained" className={styles.postButton}>
        Post
      </Button>
    </form>
  );
};
