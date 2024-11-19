# backstage-plugin-qeta

<p align="center">
<img src="https://github.com/drodil/backstage-plugin-qeta/blob/b0d06479022b1051548b57aef5a9ce8c98f5ad17/docs/images/logo.png"/>
</p>

[![CI](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml/badge.svg)](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml)

Backstage.io plugin for Q&A. This plugin is both frontend and backend that manages and displays questions and answers
within Backstage. This plugin allows users to:

- Ask and answer questions
- Write articles
- Vote questions, articles and answers
- Create custom collections containing questions and articles
- Favorite questions and articles
- Subscribe to entities, tags, collections and users and get notifications of activity
- Integrate with [AI helpers](./docs/ai.md) to answer questions
- Create question templates for predefined questions
- See contributing users, entities and tags including statistics

Backstage integrations:

- [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- [`@backstage/plugin-catalog-react`](https://github.com/backstage/backstage/tree/master/plugins/catalog-react) plugin
- [`@backstage/plugin-permission-react`](https://github.com/backstage/backstage/tree/master/plugins/permission-react) plugin
- [`@backstage/plugin-permission-common`](https://github.com/backstage/backstage/tree/master/plugins/permission-common) plugin
- [`@backstage/plugin-home`](https://github.com/backstage/backstage/tree/master/plugins/home) plugin
- [`@backstage/plugin-signals`](https://github.com/backstage/backstage/tree/master/plugins/signals) plugin
- [`@backstage/plugin-notifications`](https://github.com/backstage/backstage/tree/master/plugins/notifications) plugin
- [`@backstage/plugin-scaffolder`](https://github.com/backstage/backstage/tree/master/plugins/scaffolder-backend) plugin

See more information from our [documentation](./docs/index.md).

## Setup

Find [installation instructions](./docs/index.md#installation) in our documentation.

**IMPORTANT**: From version 2.0.0 forward, this plugin only works with the new backend system. If you are still
using the old backend system, please use version 1.24.5.

**IMPORTANT**: Migrating from 2.x to 3.x has been briefly explained in this [document](./docs/migration.md).

**IMPORTANT**: From 3.10.0 forward, this plugin is using MUIv5. If you are using MUIv4, please see the migration guide
at https://backstage.io/docs/tutorials/migrate-to-mui5/

## Examples

Home page:

![Home page](./docs/images/homePage.png)

Questions page:

![Questions page](./docs/images/questionsPage.png)

Posting question:

![Ask page](./docs/images/askPage.png)

OpenAI answer:

![OpenAI](./docs/images/openAi.png)

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

If your organization uses this plugin, we'd love to have you listed in our [ADOPTERS](ADOPTERS.md) list! ❤️

## License

This library is under the [MIT](LICENSE) license.
