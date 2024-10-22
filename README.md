# backstage-plugin-qeta

<p align="center">
<img src="https://github.com/drodil/backstage-plugin-qeta/blob/b0d06479022b1051548b57aef5a9ce8c98f5ad17/docs/images/logo.png"/>
</p>

[![CI](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml/badge.svg)](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml)

Backstage.io plugin for Q&A. This plugin is both frontend and backend that manages and displays questions and answers
within Backstage. This plugin provides:

- Support to ask and answer questions
- Support to write articles
- Support to vote questions, articles and answers
- Support to create collections containing questions and articles
- Support to favorie questions and articles
- Support to subscribe to entities and tags
- Views for users, entities and tags with their stats
- Global and user statistics
- Backend that saves questions and answers to desired database
- Integration with the [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- Integration with the [`@backstage/plugin-catalog-react`](https://github.com/backstage/backstage/tree/master/plugins/catalog-react) plugin
- Integration with the [`@backstage/plugin-permission-react`](https://github.com/backstage/backstage/tree/master/plugins/permission-react) plugin
- Integration with the [`@backstage/plugin-permission-common`](https://github.com/backstage/backstage/tree/master/plugins/permission-common) plugin
- Integration with the [`@backstage/plugin-home`](https://github.com/backstage/backstage/tree/master/plugins/home) plugin
- Integration with the [`@backstage/plugin-signals`](https://github.com/backstage/backstage/tree/master/plugins/signals) plugin
- Integration with the [`@backstage/plugin-notifications`](https://github.com/backstage/backstage/tree/master/plugins/notifications) plugin
- Integration with the [`@backstage/plugin-scaffolder`](https://github.com/backstage/backstage/tree/master/plugins/scaffolder-backend) plugin

## Setup

Find [installation instructions](./docs/index.md#installation) in our documentation.

**IMPORTANT**: From version 2.0.0 forward, this plugin only works with the new backend system. If you are still
using the old backend system, please use version 1.24.5.

## Examples

Home page:
![Home page](./docs/images/homePage.png)

Questions page:

![Questions page](./docs/images/questionsPage.png)

Posting question:

![Ask page](./docs/images/askPage.png)

Answering question:

![Questions answer](./docs/images/questionPage.png)

Adding to collection

![Collection](./docs/images/addToCollection.png)

Articles page:

![Articles page](./docs/images/articlesPage.png)

Article page:

![Article page](./docs/images/articlePage.png)

Collections page:

![Collections page](./docs/images/collectionsPage.png)

Collection page:

![Collection page](./docs/images/collectionPage.png)

Entities page:

![Entities page](./docs/images/entitiesPage.png)

Entity page:

![Entity page](./docs/images/entityPage.png)

Users page:

![Users page](./docs/images/usersPage.png)

Profile page:

![Profile page](./docs/images/profilePage.png)

Stats page:

![Stats page](./docs/images/statisticsPage.png)

Tags page:

![Tags page](./docs/images/tagsPage.png)

## Contributing

All contributions are very welcome. See [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

This library is under the [MIT](LICENSE) license.
