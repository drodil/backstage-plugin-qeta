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

- Posting question
  - payload: question, author
  - metadata.action = `post_question`
- Posting answer
  - payload: question, answer, author
  - metadata.action = `post_answer`
- Comment question
  - payload: question, author, comment
  - metadata.action = `comment_question`
- Comment answer
  - payload: question, answer, author, comment
  - metadata.action = `comment_answer`
- Answer marked as correct
  - payload: question, answer, author
  - metadata.action = `correct_answer`
- Answer marked as incorrect
  - payload: question, answer, author
  - metadata.action = `incorrect_answer`
- Vote question
  - payload: question, author, score
  - metadata.action = `vote_question`
- Vote answer
  - payload: question, answer, author, score
  - metadata.action = `vote_answer`
- Delete question
  - payload: question, author
  - metadata.action = `delete_question`
- Delete answer
  - payload: question, answer, author
  - metadata.action = `delete_answer`
