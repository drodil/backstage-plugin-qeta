# Notifications

Notifications are new Backstage feature that allows you to send notifications to users.
This plugin integrates with the notifications plugin to send notifications to users when:

- A new post, notification is sent to:
  - The entity owners if the post is related to an entity
  - Tag followers if the post is tagged
  - Users that follow the author
  - Users who are mentioned in the post
- A question is answered, notification is sent to:
  - The question author
  - Other commenters
  - The entity owners if the question is related to an entity
  - Tag followers if the question is tagged
  - Users who are mentioned in the answer
- A post is commented, notification is sent to:
  - The post author
  - The entity owners if the post is related to an entity
  - Tag followers if the post is tagged
  - Users who are mentioned in the comment
- An answer is commented, notification is sent to:
  - The answer author
  - Other commenters
  - The entity owners if the question is related to an entity
  - Tag followers if the question is tagged
  - Users who are mentioned in the comment
- An answer is marked as correct, notification is sent to:
  - The answer author
  - The question author
  - The entity owners if the question is related to an entity

## Setup

To enable notifications, you need to have the notifications plugin installed and configured.
This also requires to install the `signals` and `events` plugins to work seamlessly. See installation
instructions from the Backstage repository:

- https://github.com/backstage/backstage/tree/master/plugins/notifications
- https://github.com/backstage/backstage/tree/master/plugins/notifications-backend
- https://github.com/backstage/backstage/tree/master/plugins/signals-backend
- https://github.com/backstage/backstage/tree/master/plugins/events-backend

## Configuring notifications

At the moment, it's not possible to configure the notifications in the Backstage instance. There
is however a PR open to introduce user specific notifications in the future. See the PR here:
https://github.com/backstage/backstage/pull/23716
