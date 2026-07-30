/* eslint-disable jsx-a11y/no-autofocus */
import { useState } from 'react';
import { Button, Flex } from '@backstage/ui';
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
      <Flex justify="end" gap="2" mt="2">
        {onDiscard && (
          <Button
            variant="tertiary"
            size="small"
            onClick={() => {
              setEdited(false);
              onDiscard();
              reset();
            }}
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          variant="primary"
          size="small"
          className="qetaCommentBtn"
          type="submit"
          isDisabled={disabled}
        >
          {saveButtonTitle}
        </Button>
      </Flex>
    </form>
  );
};
