# Plugin configuration

The following configuration options are available for your app-config.yaml:

```yaml
qeta:
  allowAnonymous: true
  allowMetadataInput: false
  permissions: false
  notifications: true
  entities:
    kinds: ['Component']
    max: 3
  tags:
    allowCreation: true
    allowedTags:
      - test
      - tag2
    max: 5
  mentions:
    supportedKinds:
      - User
      - Group
  storage:
    disabled: true
    type: database
    folder: /tmp/my-attachments
```

See also config values for AI module [here](ai.md).

The allowed configuration values are:

## Global

- `allowAnonymous`, boolean, allows anonymous users to post questions and answers anonymously. This enables also guest users to be able to post. Adds checkbox to the forms to post as anonymous. Default is `false`
- `allowMetadataInput`, boolean, allows `created` and `user` fields to be passed when creating questions, answers, or comments. Useful if migrating information into the system. Default is `false`
- `allowGlobalEdits`, boolean, allows editing other users' questions and answers by any user. Only if permission framework is not in use. Default is `false`.
- `moderators`, string array, list of moderator groups or users who can edit, delete questions/answers/comments and mark answers correct for any question. Only if permissions framework is not in use.
- `permissions`, boolean, enable or disable usage of Backstage permission framework, defaults to false
- `notifications`, boolean, enable or disable usage of Backstage notifications, defaults to true

## Entities

- `entities.kinds`, string array, what kind of catalog entities can be attached to a post. Default is ['Component']
- `entities.max`, integer, maximum number of entities to attach to a post. Default is `3`
- `entities.min`, integer, minimum number of entities that has to be attached to a post. Default is `0`.

## Tags

- `tags.allowCreation`, boolean, determines whether it's possible to add new tags when creating a post. Only affects if permissions are not enabled. Moderators can always add tags from the UI even if this is false. Default is `true`
- `tags.allowedTags`, string array, list of allowed tags to be attached to posts. Only used if `tags.allowCreation` is set to `false`.
- `tags.max`, integer, maximum number of tags to be attached to a post. Default is `5`.
- `tags.min`, integer, minimum number of tags that has to be attached to a post. Default is `0`.

## Storage

- `storage.type`, string, what kind of storage is used to upload images used in questions. Default is `database`. Available values are 'filesystem', 'database', 's3' and 'azure'.
- `storage.maxSizeImage`, number, the maximum allowed size of upload files in bytes. Default is `2500000`
- `storage.folder`, string, what folder is used to storage temporarily images to convert and send to frontend. Default is `/tmp/backstage-qeta-images`
- `storage.allowedMimeTypes`, string[], A list of allowed upload formats. Default: `png,jpg,jpeg,gif`
- `storage.disabled`, boolean, If for some specific scenario you want to disable the upload of images. Default `false`
- `storage.bucket`, string, bucket ARN for S3 storage, required for S3 storage
- `storage.endpoint`, string, endpoint uri to send requests to. if not set, the default endpoint is built from the configured region, optional
- `storage.httpsProxy`, string, this allows docs to be published and read from behind a proxy, optional
- `storage.forcePathStyle`, boolean, allows other providers to be used like localstack, minio, wasabi (and possibly others), optional
- `storage.maxAttempts`, number, number of attempts to try, optional
- `storage.accessKeyId`, string, access key ID for S3 storage, optional
- `storage.secretAccessKey`, string, secret access key for S3 storage, optional
- `storage.region`, string, region for S3 storage, optional
- `storage.sessionToken`, string, AWS session token, optional
- `storage.blobStorageAccountName`, string, Azure Blob Storage account name, optional
- `storage.blobStorageConnectionString`, string, Connection String to Azure Blob Storage, optional
- `storage.blobStorageContainer`, string, Azure Blob Storage container name, optional. Default `backstage-qeta-images`

> Note: For Azure Blob Storage you can either use passwordless authentication by configuring `blobStorageAccountName`. This requires your Backstage backend to run as an Azure Managed Identity. Alternatively, you can use `blobStorageConnectionString` to authenticate with a connection string.

Additionally, there are more config values for the [OpenAI module](ai.md).
