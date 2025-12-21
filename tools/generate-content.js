/**
 * Generate content for the Q&A
 *
 * Need to set config:
 * - qeta.allowMetadataInput: true
 * - qeta.permissions: false
 */
const { program } = require('commander');
const { faker } = require('@faker-js/faker');

program.name('generate-content').description('Generate content for the Q&A');
program
  .option('-n, --number <number>', 'Number of questions to generate', 5)
  .option(
    '-a, --answers <number>',
    'Number of answers to generate for each question, defaults to random',
  )
  .option('-t, --tags <tags>', 'Comma separated list of tags to use')
  .option('-u, --user <user>', 'User to use')
  .option('-d, --created <created>', 'Created date to use')
  .option(
    '-c, --comments <comments>',
    'Number of comments to generate, defaults to random',
  )
  .option('-r --articles <articles>', 'Number of articles to generate', 5)
  .option('-l --links <links>', 'Number of links to generate', 5);

async function main() {
  program.parse();

  const options = program.opts();

  const getUser = () => {
    if (options.user) {
      return options.user;
    }
    return `user:default/${faker.person
      .fullName()
      .toLowerCase()
      .replace(/\s/g, '.')
      .replace(/\.+/g, '.')}`;
  };

  const getTags = () => {
    if (options.tags) {
      return options.tags.split(',');
    }
    return faker.lorem.words(faker.number.int({ min: 0, max: 3 })).split(' ');
  };

  const getCreated = () => {
    if (options.created) {
      return options.created;
    }
    return faker.date.recent();
  };

  const generateCodeBlock = () => {
    if (!faker.datatype.boolean()) {
      return '';
    }

    const languages = [
      'javascript',
      'python',
      'java',
      'typescript',
      'go',
      'rust',
    ];
    const language = faker.helpers.arrayElement(languages);

    // Generate random code based on language
    let code = '';
    switch (language) {
      case 'javascript':
      case 'typescript':
        code = `function ${faker.hacker.noun()}() {\n  const ${faker.hacker.noun()} = ${faker.number.int(
          100,
        )};\n  return ${faker.hacker.verb()}(${faker.hacker.noun()});\n}`;
        break;
      case 'python':
        code = `def ${faker.hacker.noun()}():\n    ${faker.hacker.noun()} = ${faker.number.int(
          100,
        )}\n    return ${faker.hacker.verb()}(${faker.hacker.noun()})`;
        break;
      case 'java':
        code = `public class ${faker.hacker.noun()} {\n    public static void main(String[] args) {\n        int ${faker.hacker.noun()} = ${faker.number.int(
          100,
        )};\n        System.out.println(${faker.hacker.verb()}(${faker.hacker.noun()}));\n    }\n}`;
        break;
      case 'go':
        code = `func ${faker.hacker.noun()}() {\n    ${faker.hacker.noun()} := ${faker.number.int(
          100,
        )}\n    return ${faker.hacker.verb()}(${faker.hacker.noun()})\n}`;
        break;
      case 'rust':
        code = `fn ${faker.hacker.noun()}() -> i32 {\n    let ${faker.hacker.noun()} = ${faker.number.int(
          100,
        )};\n    ${faker.hacker.verb()}(${faker.hacker.noun()})\n}`;
        break;
    }

    return `\n\n\`\`\`${language}\n${code}\n\`\`\``;
  };

  const fs = require('fs');
  const path = require('path');
  const yaml = require('js-yaml');

  const getEntities = () => {
    try {
      const localDevPath = path.join(__dirname, '../local_dev.yaml');
      if (!fs.existsSync(localDevPath)) {
        return [];
      }
      const fileContent = fs.readFileSync(localDevPath, 'utf8');
      const docs = yaml.loadAll(fileContent);
      const entities = [];
      docs.forEach(doc => {
        if (!doc || !doc.metadata || !doc.metadata.name || !doc.kind) {
          return;
        }
        if (doc.kind.toLowerCase() === 'user') {
          return;
        }
        const kind = doc.kind.toLowerCase();
        const name = doc.metadata.name;
        const namespace = doc.metadata.namespace || 'default';
        entities.push(`${kind}:${namespace}/${name}`);
      });
      return entities;
    } catch (e) {
      console.error('Failed to parse local_dev.yaml', e);
      return [];
    }
  };

  const entities = getEntities();

  const getRandomEntities = () => {
    if (entities.length === 0) {
      return [];
    }
    const count = faker.number.int({ min: 0, max: 5 });
    return faker.helpers.arrayElements(entities, count);
  };

  const createVotesForPost = async id => {
    const voteCount = faker.number.int({ min: 0, max: 20 });
    for (let i = 0; i < voteCount; i++) {
      const user = getUser();
      const score = faker.datatype.boolean() ? 1 : -1;
      const type = score === 1 ? 'upvote' : 'downvote';
      await fetch(`http://localhost:7007/api/qeta/posts/${id}/${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
          'x-qeta-user': user,
        },
      });
    }
    console.log(`- Created ${voteCount} votes for post ${id}`);
  };

  const createViewsForPost = async id => {
    const viewCount = faker.number.int({ min: 0, max: 50 });
    for (let i = 0; i < viewCount; i++) {
      await fetch(`http://localhost:7007/api/qeta/posts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
        },
      });
    }
    console.log(`- Created ${viewCount} views for post ${id}`);
  };

  const createVotesForAnswer = async (postId, answerId) => {
    const voteCount = faker.number.int({ min: 0, max: 10 });
    for (let i = 0; i < voteCount; i++) {
      const user = getUser();
      const score = faker.datatype.boolean() ? 1 : -1;
      const type = score === 1 ? 'upvote' : 'downvote';
      await fetch(
        `http://localhost:7007/api/qeta/posts/${postId}/answers/${answerId}/${type}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
            'x-qeta-user': user,
          },
        },
      );
    }
  };

  const createCommentsForPost = async id => {
    const length = options.comments || faker.number.int({ min: 0, max: 6 });
    const comments = Array.from({ length }, () => ({
      content: faker.lorem.paragraphs(
        faker.number.int({ min: 1, max: 6 }),
        '\n\n',
      ),
      user: getUser(),
      created: getCreated(),
    }));

    for (const comment of comments) {
      const resp = await fetch(
        `http://localhost:7007/api/qeta/posts/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
          },
          body: JSON.stringify(comment),
        },
      );
      const data = await resp.json();
      console.log(`- Created comment for post ${id} with id: ${data.id}`);
    }
    return comments.length;
  };

  const createCommentsForAnswer = async (postId, id) => {
    const length = options.comments || faker.number.int({ min: 0, max: 6 });
    const comments = Array.from({ length }, () => ({
      content: faker.lorem.paragraphs(
        faker.number.int({ min: 1, max: 6 }),
        '\n\n',
      ),
      user: getUser(),
      created: getCreated(),
    }));

    for (const comment of comments) {
      const resp = await fetch(
        `http://localhost:7007/api/qeta/posts/${postId}/answers/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
          },
          body: JSON.stringify(comment),
        },
      );
      const data = await resp.json();
      console.log(
        `  - Created comment for post ${postId} and answer ${id} with id: ${data.id}`,
      );
    }
    return comments.length;
  };

  const createAnswersForPost = async id => {
    const length = options.answers || faker.number.int({ min: 0, max: 6 });
    const answers = Array.from({ length }, () => ({
      answer: `${faker.lorem.paragraphs(
        faker.number.int({ min: 1, max: 6 }),
        '\n\n',
      )}${generateCodeBlock()}`,
      user: getUser(),
      created: getCreated(),
    }));
    let commentCount = 0;

    for (const answer of answers) {
      const resp = await fetch(
        `http://localhost:7007/api/qeta/posts/${id}/answers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
          },
          body: JSON.stringify(answer),
        },
      );
      const data = await resp.json();
      console.log(`- Created answer for question ${id} with id: ${data.id}`);
      await createVotesForAnswer(id, data.id);
      commentCount += await createCommentsForAnswer(id, data.id);
    }
    return { answerCount: answers.length, commentCount };
  };

  let answerCount = 0;
  let commentCount = 0;
  const questions = Array.from({ length: options.number }, () => ({
    title: faker.lorem.sentence(),
    content: `${faker.lorem.paragraphs(
      faker.number.int({ min: 1, max: 6 }, '\n\n'),
    )}${generateCodeBlock()}`,
    tags: getTags(),
    user: getUser(),
    created: getCreated(),
    entities: getRandomEntities(),
    type: 'question',
  }));

  for (const question of questions) {
    const resp = await fetch('http://localhost:7007/api/qeta/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
      },
      body: JSON.stringify(question),
    });
    const data = await resp.json();
    const id = data.id;
    console.log(`Created question with id: ${id}`);
    await createVotesForPost(id);
    await createViewsForPost(id);
    const ret = await createAnswersForPost(id);
    answerCount += ret.answerCount;
    commentCount += ret.commentCount;
    commentCount += await createCommentsForPost(id);
  }

  const articles = Array.from({ length: options.articles }, () => ({
    title: faker.lorem.sentence(),
    content: `${faker.lorem.paragraphs(
      faker.number.int({ min: 8, max: 30 }),
      '\n\n',
    )}${generateCodeBlock()}`,
    tags: getTags(),
    user: getUser(),
    created: getCreated(),
    entities: getRandomEntities(),
    type: 'article',
  }));

  for (const article of articles) {
    const resp = await fetch('http://localhost:7007/api/qeta/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
      },
      body: JSON.stringify(article),
    });
    const data = await resp.json();
    console.log(`Created article with id: ${data.id}`);
    await createVotesForPost(data.id);
    await createViewsForPost(data.id);
    commentCount += await createCommentsForPost(data.id);
  }

  const links = Array.from({ length: options.number }, () => ({
    title: faker.lorem.sentence(),
    content: faker.internet.url(),
    type: 'link',
    tags: getTags(),
    user: getUser(),
    created: getCreated(),
    entities: getRandomEntities(),
  }));

  for (const link of links) {
    const resp = await fetch('http://localhost:7007/api/qeta/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer FO23CjUG7SNlPWPCO3x25W3TlPC8lh8l',
      },
      body: JSON.stringify(link),
    });
    const data = await resp.json();
    console.log(`Created link with id: ${data.id}`);
    await createVotesForPost(data.id);
    await createViewsForPost(data.id);
    commentCount += await createCommentsForPost(data.id);
  }

  console.log('---------');
  console.log('DONE!');
  console.log(
    `Created ${questions.length} questions, ${articles.length} articles, ${links.length} links, ${answerCount} answers, and ${commentCount} comments`,
  );
}

main().catch(console.error);
