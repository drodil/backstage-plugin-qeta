/* eslint-disable no-console */
import { useState } from 'react';
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde.css';
import 'react-mde/lib/styles/css/react-mde-editor.css';
import 'react-mde/lib/styles/css/react-mde-toolbar.css';
import { configApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import { qetaApiRef } from '../../api';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { imageUpload } from '../../utils';
import { makeStyles } from '@material-ui/core';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  GroupEntity,
  stringifyEntityRef,
  UserEntity,
} from '@backstage/catalog-model';
import { findTagMentions } from '@drodil/backstage-plugin-qeta-common';

export type QetaMarkdownEditorClassKey =
  | 'markdownEditor'
  | 'markdownEditorError'
  | 'markdownPreview'
  | 'suggestionsDropdown';

export const useStyles = makeStyles(
  theme => {
    return {
      markdownEditor: {
        backgroundColor: 'initial',
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.action.disabled}`,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          borderColor: theme.palette.action.active,
        },
        '&:focus-within': {
          borderColor: theme.palette.primary.main,
        },
        '& .mde-header': {
          backgroundColor: 'initial',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.action.selected}`,
          '& .mde-tabs button, .mde-header-item > button': {
            color: `${theme.palette.text.primary} !important`,
          },
        },
        '& .mde-preview-content': {
          padding: '10px',
        },
        '& .mde-text, .mde-preview': {
          fontSize: theme.typography.body1.fontSize,
          fontFamily: theme.typography.body1.fontFamily,
          lineHeight: theme.typography.body1.lineHeight,
        },
        '& .mde-text': {
          backgroundColor: 'initial',
          color: theme.palette.text.primary,
          outline: 'none',
        },
        '& .image-tip': {
          color: theme.palette.text.primary,
          backgroundColor: 'initial',
        },
      },
      markdownEditorError: {
        border: `1px solid ${theme.palette.error.main} !important`,
      },
      markdownPreview: {
        '& *': {
          wordBreak: 'break-word',
        },
        '&.inline': {
          display: 'inline-block',
        },
        '& > :first-child': {
          marginTop: '0px !important',
        },
        '& > :last-child': {
          marginBottom: '0px !important',
        },
      },
      suggestionsDropdown: {
        position: 'absolute',
        minWidth: '180px',
        margin: '20px 0 0',
        listStyle: 'none',
        padding: '0',
        cursor: 'pointer',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        '& li': {
          width: '100%',
          padding: '0.5rem',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
      hide: {
        display: 'none',
      },
    };
  },
  { name: 'QetaMarkdownEditor' },
);

export type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onTagsChange?: (tags: string[]) => void;
  height: number;
  name?: string;
  error?: boolean;
  placeholder?: string;
  onImageUpload?: (imageId: number) => void;
  disableToolbar?: boolean;
  disableAttachments?: boolean;
  disablePreview?: boolean;
  postId?: number;
  disabled?: boolean;
  answerId?: number;
  collectionId?: number;
  autoFocus?: boolean;
  required?: boolean;
};

const NO_SUGGESTIONS = [{ preview: 'No suggestions', value: '' }];

export const MarkdownEditor = (props: MarkdownEditorProps) => {
  const {
    value,
    onChange,
    height,
    disabled,
    error,
    placeholder,
    disableAttachments,
    onTagsChange,
    name,
    disableToolbar,
    disablePreview,
    postId,
    answerId,
    collectionId,
    autoFocus,
    required = true,
  } = props;
  const [selectedTab, setSelectedTab] = useState<'write' | 'preview'>('write');
  const styles = useStyles();
  const errorApi = useApi(errorApiRef);
  const qetaApi = useApi(qetaApiRef);
  const catalogApi = useApi(catalogApiRef);
  const config = useApi(configApiRef);

  // Get the enabled mention types from the configuration,
  // defaulting to 'user' if not specified, to keep the current behavior.
  const enabledMentionTypes = config.getOptionalStringArray(
    'qeta.mentions.supportedKinds',
  ) || ['user'];

  const loadEntitySuggestions = async (text: string) => {
    const supportedKinds = ['user', 'group'] as const;
    // Filter the supported kinds based on the enabled mention types
    // to ensure we only query for the kinds that are enabled.
    const enabledKinds = supportedKinds.filter(kind =>
      enabledMentionTypes.includes(kind.toLowerCase()),
    );
    if (!text) {
      return NO_SUGGESTIONS;
    }
    const entities = await catalogApi.queryEntities({
      filter: { kind: enabledKinds },
      limit: 5,
      fullTextFilter: {
        term: text,
        fields: [
          'metadata.name',
          'metadata.title',
          'spec.profile.displayName',
          'spec.profile.email',
        ],
      },
    });

    if (entities.items.length === 0) {
      return NO_SUGGESTIONS;
    }

    const users = entities.items.filter(
      entity => entity.kind === 'User',
    ) as UserEntity[];
    const groups = entities.items.filter(
      entity => entity.kind === 'Group',
    ) as GroupEntity[];

    const userSuggestions = users.map(entity => {
      const user = entity as UserEntity;
      const preview =
        user.metadata.title ??
        user.spec?.profile?.displayName ??
        user.metadata.name;
      return {
        preview,
        value: `@${stringifyEntityRef(user)}`,
      };
    });

    const groupSuggestions = groups.map(entity => {
      const group = entity as GroupEntity;
      const preview = group.spec?.profile?.displayName ?? group.metadata.name;
      return {
        preview: preview,
        value: `@${stringifyEntityRef(entity)}`,
      };
    });

    return [...userSuggestions, ...groupSuggestions];
  };

  const loadTagSuggestions = async (text: string) => {
    if (!text) {
      return NO_SUGGESTIONS;
    }
    const tags = await qetaApi.getTags({ searchQuery: text });
    if (tags.tags.length === 0) {
      return NO_SUGGESTIONS;
    }
    return tags.tags.map(tag => {
      return {
        preview: tag.tag,
        value: `#${tag.tag}`,
      };
    });
  };

  const loadSuggestions = async (text: string, triggeredBy: string) => {
    if (!text || !triggeredBy) {
      return NO_SUGGESTIONS;
    }
    if (triggeredBy === '@') {
      return loadEntitySuggestions(text);
    }
    if (triggeredBy === '#') {
      return loadTagSuggestions(text);
    }
    return NO_SUGGESTIONS;
  };

  const isUploadDisabled =
    config?.getOptionalBoolean('qeta.storage.disabled') ||
    disableAttachments ||
    false;

  return (
    <ReactMde
      classes={{
        reactMde: `qetaMarkdownEditorEdit ${styles.markdownEditor}`,
        textArea: error
          ? `qetaMarkdownEditorError ${styles.markdownEditorError}`
          : undefined,
        preview: 'qetaMarkdownEditorPreview',
        toolbar: `${
          disableToolbar ? styles.hide : ''
        } qetaMarkdownEditorToolbar`,
        suggestionsDropdown: styles.suggestionsDropdown,
      }}
      disablePreview={disablePreview}
      value={value}
      onChange={onChange}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      minEditorHeight={height}
      minPreviewHeight={height - 10}
      childProps={{
        textArea: {
          required,
          placeholder,
          disabled,
          autoFocus,
          name,
          onBlur: () => {
            if (onTagsChange) {
              onTagsChange(findTagMentions(value).map(t => t.slice(1)));
            }
          },
        },
      }}
      suggestionTriggerCharacters={['@', '#']}
      loadSuggestions={loadSuggestions}
      suggestionsAutoplace
      generateMarkdownPreview={content =>
        Promise.resolve(
          <MarkdownRenderer
            content={content}
            className={`qetaMarkdownEditorPreview ${styles.markdownPreview}`}
            useBlankLinks
          />,
        )
      }
      paste={
        isUploadDisabled
          ? undefined
          : {
              saveImage: imageUpload({
                qetaApi,
                errorApi,
                onImageUpload: props.onImageUpload,
                postId,
                answerId,
                collectionId,
              }),
            }
      }
    />
  );
};
