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
  .option('-r --articles <articles>', 'Number of articles to generate', 1);

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
    commentCount += await createCommentsForPost(data.id);
  }

  console.log('---------');
  console.log('DONE!');
  console.log(
    `Created ${questions.length} questions, ${articles.length} articles, ${answerCount} answers, and ${commentCount} comments`,
  );
}

main().catch(console.error);
