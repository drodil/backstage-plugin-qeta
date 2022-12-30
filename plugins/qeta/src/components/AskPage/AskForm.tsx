import { useApi } from '@backstage/core-plugin-api';
import { Button, TextField } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { useNavigate } from 'react-router-dom';
import { QetaApi, qetaApiRef, QuestionRequest } from '../../api';
import { useStyles } from '../../utils/hooks';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { getEntityTitle } from '../../utils/utils';
import { CatalogApi } from '@backstage/catalog-client';
import { compact } from 'lodash';

interface QuestionForm {
  title: string;
  content: string;
  tags?: string[];
  components?: Entity[];
}

const formToRequest = (form: QuestionForm): QuestionRequest => {
  return {
    ...form,
    components: form.components?.map(stringifyEntityRef),
  };
};

const getDefaultValues = (): QuestionForm => {
  return {
    title: '',
    content: '',
    tags: [],
    components: [],
  };
};

const getValues = async (
  api: QetaApi,
  catalogApi: CatalogApi,
  id?: string,
): Promise<QuestionForm> => {
  if (!id) {
    return getDefaultValues();
  }

  const question = await api.getQuestion(id);
  const entities = question.components
    ? await catalogApi.getEntitiesByRefs({ entityRefs: question.components })
    : [];
  return {
    title: question.title,
    content: question.content,
    tags: question.tags ?? [],
    components: 'items' in entities ? compact(entities.items) : [],
  };
};

export const AskForm = (props: { id?: string }) => {
  const { id } = props;
  const navigate = useNavigate();
  const [values, setValues] = React.useState(getDefaultValues());
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
  } = useForm<QuestionForm>({
    values,
    defaultValues: getDefaultValues(),
  });

  const postQuestion = (data: QuestionForm) => {
    if (id) {
      qetaApi
        .updateQuestion(id, formToRequest(data))
        .then(q => {
          if (!q || !q.id) {
            setError(true);
            return;
          }
          reset();
          navigate(`/qeta/questions/${q.id}`);
        })
        .catch(_e => setError(true));
    }
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
    getValues(qetaApi, catalogApi, id).then(data => {
      setValues(data);
    });
  }, [qetaApi, catalogApi, id]);

  useEffect(() => {
    reset(values);
  }, [values, reset]);

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
      {error && <Alert severity="error">Could not post question</Alert>}
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
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              multiple
              id="tags-select"
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
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              multiple
              value={value}
              id="components-select"
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
        {id ? 'Save' : 'Post'}
      </Button>
    </form>
  );
};
