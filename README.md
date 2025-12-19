# backstage-plugin-qeta

<p align="center">
<img src="https://github.com/drodil/backstage-plugin-qeta/blob/main/docs/images/logo.png" width="200"/>
</p>

[![CI](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml/badge.svg)](https://github.com/drodil/backstage-plugin-qeta/actions/workflows/ci.yaml)

**Qeta** is a comprehensive Q&A and knowledge sharing plugin for Backstage, inspired by Stack Overflow. It allows your engineering teams to ask questions, share answers, write articles, and build a knowledge base directly within your developer portal.

## ✨ Features

- **Q&A Platform**: Ask questions, provide answers, and comment on discussions.
- **Knowledge Base**: Write and publish articles for longer-form content.
- **Organization**: Use tags and collections to organize content effectively.
- **Social Features**: Vote on content, mark favorites, and follow users or tags.
- **Gamification**: View statistics and top contributors (users, specific entities).
- **AI Integration**: Optional integration with AI models to assist in answering questions.
- **Entity Integration**: Link questions to specific components or resources in your catalog.
- **Notifications**: innovative notification system for new questions, answers, and mentions.

## 📚 Documentation

Detailed documentation is available in the `docs` directory:

| Topic                                            | Description                                                     |
| :----------------------------------------------- | :-------------------------------------------------------------- |
| **[Getting Started](./docs/index.md)**           | Overview and quick start guide.                                 |
| **[Setup](./docs/setup.md)**                     | Installation instructions for frontend and backend.             |
| **[Configuration](./docs/config.md)**            | detailed configuration options.                                 |
| **[Integrations](./docs/index.md#integrations)** | How to integrate with Search, Signals, Notifications, and more. |
| **[AI Assistants](./docs/ai.md)**                | API and setup for AI-powered answers.                           |
| **[Migration](./docs/migration.md)**             | Guide for upgrading between major versions.                     |
| **[Permissions](./docs/permissions.md)**         | Setting up RBAC and permission policies.                        |

## 🔌 Integrations

Qeta integrates seamlessly with many Backstage plugins:

- **[Search](https://github.com/backstage/backstage/tree/master/plugins/search)**: Index questions and answers in Backstage global search.
- **[Catalog](https://github.com/backstage/backstage/tree/master/plugins/catalog-react)**: Link questions to catalog entities.
- **[Notifications](https://github.com/backstage/backstage/tree/master/plugins/notifications)**: Receive alerts for relevant activity.
- **[Signals](https://github.com/backstage/backstage/tree/master/plugins/signals)**: Real-time updates.
- **[Home](https://github.com/backstage/backstage/tree/master/plugins/home)**: Widgets for your homepage.

> [!IMPORTANT] > **Version 2.0.0+** requires the new Backstage backend system. Use version 1.24.5 for the old backend system.
>
> **Version 3.22.0+** requires Backstage 1.36.0 or later due to permission integration changes.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.
If your organization uses Qeta, please add yourself to our [ADOPTERS](ADOPTERS.md) list! ❤️

## 📄 License

This library is under the [MIT](LICENSE) license.
