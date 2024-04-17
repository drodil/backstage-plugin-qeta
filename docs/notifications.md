# Notifications

Notifications are new Backstage feature that allows you to send notifications to users.
This plugin integrates with the notifications plugin to send notifications to users when:

- A new question is posted about an entity
  - Notification is sent to the entity owners
- A question is answered
  - Notification is sent to the question author and the entity owners
- A question is commented
  - Notification is sent to the question author
- An answer is commented
  - Notification is sent to the answer author
- An answer is marked as correct
  - Notification is sent to the answer author

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
