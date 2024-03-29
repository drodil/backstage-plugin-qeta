# Plugin configuration

The following configuration options are available for your app-config.yaml:

```yaml
qeta:
  allowAnonymous: true
  allowMetadataInput: false
  entities:
    kinds: ['Component']
    max: 3
  tags:
    allowCreation: true
    allowedTags:
      - test
      - tag2
    max: 5
  storage:
    disabled: true
    type: database
    folder: /tmp/my-attachments
```

The configuration values are:

- allowAnonymous, boolean, allows anonymous users to post questions and answers anonymously. This enables also guest users to be able to post. Adds checkbox to the forms to post as anonymous. Default is `false`
- allowMetadataInput, boolean, allows `created` and `user` fields to be passed when creating questions, answers, or comments. Useful if migrating information into the system. Default is `false`
- entities.kinds, string array, what kind of catalog entities can be attached to a question. Default is ['Component']
- entities.max, integer, maximum number of entities to attach to a question. Default is `3`
- tags.allowCreation, boolean, determines whether it's possible to add new tags when creating question. Default is `true`
- tags.allowedTags, string array, list of allowed tags to be attached to questions. Only used if `tags.allowCreation` is set to `false`.
- tags.max, integer, maximum number of tags to be attached to a question. Default is `5`.
- storage.type, string, what kind of storage is used to upload images used in questions. Default is `database`. Available values are 'filesystem', 'database' and 's3'.
- storage.maxSizeImage, number, the maximum allowed size of upload files in bytes. Default is `2500000`
- storage.folder, string, what folder is used to storage temporarily images to convert and send to frontend. Default is `/tmp/backstage-qeta-images`
- storage.allowedMimeTypes, string[], A list of allowed upload formats. Default: `png,jpg,jpeg,gif`
- storage.disabled, boolean, If for some specific scenario you want to disable the upload of images. Default `false`
- storage.bucket, string, bucket ARN for S3 storage, required for S3 storage
- storage.accessKeyId, string, access key ID for S3 storage, optional
- storage.secretAccessKey, string, secret access key for S3 storage, optional
- storage.region, string, region for S3 storage, optional
- storage.sessionToken, string, AWS session token, optional
