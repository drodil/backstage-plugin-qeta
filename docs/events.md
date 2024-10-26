# Support for events backend

Q&A plugin publishes messages through Backstage Event system utilizing `EventsService`.
To set up the event broker in your application, follow the steps described in
https://github.com/backstage/backstage/tree/master/plugins/events-backend.

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/events-backend'));
backend.add(import('@drodil/backstage-plugin-qeta-backend'));

backend.start();
```

Events are published in topic `qeta`. The following events are published:

- New post
  - payload: post, author
  - metadata.action = `new_post`
- Posting answer
  - payload: question, answer, author
  - metadata.action = `post_answer`
- Comment post
  - payload: post, author, comment
  - metadata.action = `comment_post`
- Comment answer
  - payload: question, answer, author, comment
  - metadata.action = `comment_answer`
- Answer marked as correct
  - payload: question, answer, author
  - metadata.action = `correct_answer`
- Answer marked as incorrect
  - payload: question, answer, author
  - metadata.action = `incorrect_answer`
- Vote post
  - payload: post, author, score
  - metadata.action = `vote_post`
- Vote answer
  - payload: question, answer, author, score
  - metadata.action = `vote_answer`
- Delete post
  - payload: post, author
  - metadata.action = `delete_post`
- Delete answer
  - payload: question, answer, author
  - metadata.action = `delete_answer`
- New collection
  - payload: collection, author
  - metadata.action = `new_collection`
- Update collection
  - payload: collection, author
  - metadata.action = `update_collection`
- Delete collection
  - payload: collection, author
  - metadata.action = `delete_collection`
