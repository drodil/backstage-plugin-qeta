import React from 'react';
import ReactMde from 'react-mde';
import { MarkdownContent } from '@backstage/core-components';
import 'react-mde/lib/styles/css/react-mde.css';
import 'react-mde/lib/styles/css/react-mde-editor.css';
import 'react-mde/lib/styles/css/react-mde-toolbar.css';
import { useStyles } from '../../utils/hooks';

export const MarkdownEditor = (props: {
  value: string;
  onChange: (value: string) => void;
  height: number;
  error?: boolean;
  placeholder?: string;
}) => {
  const { value, onChange, height, error, placeholder } = props;
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'write',
  );
  const styles = useStyles();

  return (
    <ReactMde
      classes={{
        reactMde: styles.markdownEditor,
        textArea: error ? styles.markdownEditorError : undefined,
      }}
      value={value}
      onChange={onChange}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      minEditorHeight={height}
      minPreviewHeight={height - 10}
      childProps={{
        textArea: {
          required: true,
          placeholder,
        },
      }}
      generateMarkdownPreview={content =>
        Promise.resolve(
          <MarkdownContent
            content={content}
            dialect="gfm"
            className={styles.markdownContent}
          />,
        )
      }
    />
  );
};
