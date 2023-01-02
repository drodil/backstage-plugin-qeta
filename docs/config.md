# Plugin configuration

The following configuration options are available for your app-config.yaml:

```yaml
qeta:
  allowAnonymous: true
  entityKinds: ['Component']
```

The configuration values are:

- allowAnonymous, boolean, allows anonymous users to post questions and answers. If enabled all users without authentication will be named after guest user. Required for local development.
- entityKinds, string array, what kind of catalog entities can be attached to a question. Default is ['Component']
