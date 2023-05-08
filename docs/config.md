# Plugin configuration

The following configuration options are available for your app-config.yaml:

```yaml
qeta:
  allowAnonymous: true
  entityKinds: ['Component']
  storage:
    disabled: true
    type: database
    folder: /tmp/my-attachments
```

The configuration values are:

- allowAnonymous, boolean, allows anonymous users to post questions and answers. If enabled all users without authentication will be named after guest user. Required for local development.
- entityKinds, string array, what kind of catalog entities can be attached to a question. Default is ['Component']
- storage.type, string, what kind of storage is used to upload images used in questions. Default is `database`
- storage.maxSizeImage, number, the maximum allowed size of upload files in bytes. Default is `2500000`
- storage.folder, string, what folder is used to storage temporarily images to convert and send to frontend. Default is `/tmp/backstage-qeta-images`
- storage.allowedMimeTypes, string[], A list of allowed upload formats. Default: `png,jpg,jpeg,gif`
- storage.disabled, boolean, If for some specific scenario you want to disable the upload of images. Default `false`
