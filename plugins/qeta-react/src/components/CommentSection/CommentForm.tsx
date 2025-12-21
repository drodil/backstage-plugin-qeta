/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/no-autofocus */
import { useState } from 'react';
import { Button } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor.tsx';
import { useConfirmNavigationIfEdited } from '../../utils';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { qetaTranslationRef } from '../../translation.ts';

export const CommentForm = (props: {
  submit: (data: { content: string }) => void;
  disabled?: boolean;
  defaultValues?: { content: string };
  saveButtonTitle: string;
  onDiscard?: () => void;
}) => {
  const { submit, disabled, saveButtonTitle, defaultValues, onDiscard } = props;
  const { t } = useTranslationRef(qetaTranslationRef);
  const { handleSubmit, control, reset } = useForm<{ content: string }>({
    defaultValues,
  });
  const [edited, setEdited] = useState(false);
  useConfirmNavigationIfEdited(edited);

  return (
    <form
      onSubmit={handleSubmit(submit)}
      onChange={() => {
        setEdited(true);
      }}
      className="qetaCommentForm"
    >
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '0.5rem',
        }}
      >
        {onDiscard && (
          <Button
            variant="text"
            size="small"
            color="primary"
            onClick={() => {
              setEdited(false);
              onDiscard();
              reset();
            }}
            style={{ marginRight: '0.5rem' }}
          >
            {t('common.cancel')}
          </Button>
        )}
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
      </div>
    </form>
  );
};
