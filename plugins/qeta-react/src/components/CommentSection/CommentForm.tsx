/* eslint-disable jsx-a11y/no-autofocus */
import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor.tsx';
import { useConfirmNavigationIfEdited } from '../../utils';

export const CommentForm = (props: {
  submit: (data: { content: string }) => void;
  disabled?: boolean;
  defaultValues?: { content: string };
  saveButtonTitle: string;
}) => {
  const { submit, disabled, saveButtonTitle, defaultValues } = props;
  const { handleSubmit, control } = useForm<{ content: string }>({
    defaultValues,
  });
  const [edited, setEdited] = React.useState(false);
  useConfirmNavigationIfEdited(edited);

  return (
    <form
      onSubmit={handleSubmit(submit)}
      onChange={() => {
        setEdited(true);
      }}
      className="qetaCommentForm"
    >
      <Grid container>
        <Grid item xs={11}>
          <Controller
            control={control}
            defaultValue=""
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <MarkdownEditor
                autoFocus
                value={value}
                onChange={onChange}
                height={100}
                disablePreview
                disableAttachments
                disableToolbar
                disabled={disabled}
              />
            )}
            name="content"
          />
        </Grid>
        <Grid item xs={1}>
          <Button
            variant="contained"
            size="small"
            className="qetaCommentBtn"
            type="submit"
            color="primary"
            disabled={disabled}
          >
            {saveButtonTitle}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
