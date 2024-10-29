# Migration from 2.x to 3.x

There are a couple of things that have changed in the 3.x version of the plugin.

Most of the frontend components have been moved to the `@drodil/backstage-plugin-qeta-react` package allowing
to use them from other frontend plugins without breaking the rule of two frontend plugins depending on each
other.

Additionally, the questions have been renamed to `posts` in many places as the version 3.x supports more
than just questions.

For example the `QuestionsContainer` component is now `PostsContainer` and is located in the
`@drodil/backstage-plugin-qeta-react` package. Renaming changes relate to:

- [Permissions](permissions.md)
- [Notifications](notifications.md)
- [Events](events.md)

Additionally, the `QetaApi` and `QetaClient` have been moved to the `@drodil/backstage-plugin-qeta-common` package.
This allows to utilize the client in the backend as well. The `qetaApiRef` now lives in the
`@drodil/backstage-plugin-qeta-react` package so that it can be utilized by other frontend plugins.
