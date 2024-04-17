# backstage-plugin-qeta

<p align="center">
<img src="https://github.com/drodil/backstage-plugin-qeta/blob/b0d06479022b1051548b57aef5a9ce8c98f5ad17/docs/images/logo.png"/>
</p>

[![CI](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml/badge.svg)](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml)

Backstage.io plugin for Q&A. This plugin is both frontend and backend that manages and displays questions and answers
within Backstage. This plugin provides:

- Interface to ask questions
- Interface to answer questions
- Interface to vote questions and answers
- Interface for individual users and tags
- Backend that saves questions and answers to desired database
- Integration with the [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- Integration with the [`@backstage/plugin-catalog-react`](https://github.com/backstage/backstage/tree/master/plugins/catalog-react) plugin
- Integration with the [`@backstage/plugin-permission-react`](https://github.com/backstage/backstage/tree/master/plugins/permission-react) plugin
- Integration with the [`@backstage/plugin-permission-common`](https://github.com/backstage/backstage/tree/master/plugins/permission-common) plugin
- Integration with the [`@backstage/plugin-home`](https://github.com/backstage/backstage/tree/master/plugins/home) plugin
- Integration with the [`@backstage/plugin-signals`](https://github.com/backstage/backstage/tree/master/plugins/signals) plugin
- Integration with the [`@backstage/plugin-notifications`](https://github.com/backstage/backstage/tree/master/plugins/notifications) plugin

## Setup

Find [installation instructions](./docs/index.md#installation) in our documentation.

**IMPORTANT**: From version 2.0.0 forward, this plugin only works with the new backend system. If you are still
using the old backend system, please use version 1.24.5.

## Examples

Questions list:

![Questions list](./docs/images/question_list.png)

Posting question:

![Questions list](./docs/images/question_posting.png)

Answering question:

![Questions list](./docs/images/question_answer.png)

Tags page:

![Tags page](./docs/images/tags_page.png)

## Contributing

All contributions are very welcome. See [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

This library is under the [MIT](LICENSE) license.
