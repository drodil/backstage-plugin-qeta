/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('user_stats', table => {
    table.integer('reputation').unsigned().notNullable().defaultTo(0);
  });

  await knex.schema.createTable('badges', table => {
    table.increments('id').primary();
    table.string('key').notNullable().unique();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('icon').notNullable();
    table.string('level').notNullable(); // diamond, gold, silver, bronze
    table.string('type').notNullable(); // one-time, repetitive
    table.integer('reputation').defaultTo(0);
  });

  await knex.schema.createTable('user_badges', table => {
    table.increments('id').primary();
    table.string('userRef').notNullable();
    table
      .integer('badgeId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('badges')
      .onDelete('CASCADE');
    table.string('uniqueKey').nullable();
    table.timestamp('created').defaultTo(knex.fn.now()).notNullable();
    table.index(['userRef']);
    table.unique(['userRef', 'badgeId', 'uniqueKey']);
  });

  const views = knex('post_views')
    .select('author')
    .count('* as totalViews')
    .groupBy('author')
    .as('v');

  const questions = knex('posts')
    .select('author')
    .where('type', 'question')
    .count('* as totalQuestions')
    .groupBy('author')
    .as('q');

  const articles = knex('posts')
    .select('author')
    .where('type', 'article')
    .count('* as totalArticles')
    .groupBy('author')
    .as('ar');

  const links = knex('posts')
    .select('author')
    .where('type', 'link')
    .count('* as totalLinks')
    .groupBy('author')
    .as('l');

  const answers = knex('answers')
    .select('author')
    .count('* as totalAnswers')
    .groupBy('author')
    .as('a');

  const comments = knex('comments')
    .select('author')
    .count('* as totalComments')
    .groupBy('author')
    .as('c');

  const aVotes = knex('answer_votes')
    .select('author')
    .count('* as answerVotes')
    .groupBy('author')
    .as('av');

  const pVotes = knex('post_votes')
    .select('author')
    .count('* as postVotes')
    .groupBy('author')
    .as('pv');

  const followers = knex('user_users')
    .select('followedUserRef as author')
    .count('* as totalFollowers')
    .groupBy('followedUserRef')
    .as('f');

  const badges = knex('user_badges')
    .join('badges', 'user_badges.badgeId', 'badges.id')
    .select('user_badges.userRef as author')
    .sum('badges.reputation as badgeReputation')
    .groupBy('user_badges.userRef')
    .as('b');

  await knex.schema.createView('user_stats_view', view => {
    view.as(
      knex('unique_authors')
        .leftJoin(views, 'unique_authors.author', 'v.author')
        .leftJoin(questions, 'unique_authors.author', 'q.author')
        .leftJoin(articles, 'unique_authors.author', 'ar.author')
        .leftJoin(links, 'unique_authors.author', 'l.author')
        .leftJoin(answers, 'unique_authors.author', 'a.author')
        .leftJoin(comments, 'unique_authors.author', 'c.author')
        .leftJoin(aVotes, 'unique_authors.author', 'av.author')
        .leftJoin(pVotes, 'unique_authors.author', 'pv.author')
        .leftJoin(followers, 'unique_authors.author', 'f.author')
        .leftJoin(badges, 'unique_authors.author', 'b.author')
        .select(
          'unique_authors.author as userRef',
          knex.raw('COALESCE(v."totalViews", 0) as "totalViews"'),
          knex.raw('COALESCE(q."totalQuestions", 0) as "totalQuestions"'),
          knex.raw('COALESCE(ar."totalArticles", 0) as "totalArticles"'),
          knex.raw('COALESCE(l."totalLinks", 0) as "totalLinks"'),
          knex.raw('COALESCE(a."totalAnswers", 0) as "totalAnswers"'),
          knex.raw('COALESCE(c."totalComments", 0) as "totalComments"'),
          knex.raw('COALESCE(av."answerVotes", 0) as "answerVotes"'),
          knex.raw('COALESCE(pv."postVotes", 0) as "postVotes"'),
          knex.raw(
            'COALESCE(av."answerVotes", 0) + COALESCE(pv."postVotes", 0) as "totalVotes"',
          ),
          knex.raw(
            'COALESCE(q."totalQuestions", 0) + COALESCE(ar."totalArticles", 0) + COALESCE(l."totalLinks", 0) as "totalPosts"',
          ),
          knex.raw('COALESCE(f."totalFollowers", 0) as "totalFollowers"'),
          knex.raw(
            `(COALESCE(q."totalQuestions", 0) * 15) + (COALESCE(ar."totalArticles", 0) * 20) + (COALESCE(l."totalLinks", 0) * 10) + (COALESCE(a."totalAnswers", 0) * 8) + (COALESCE(c."totalComments", 0) * 3) + ((COALESCE(av."answerVotes", 0) + COALESCE(pv."postVotes", 0)) * 2) + (COALESCE(v."totalViews", 0) / 100) + COALESCE(b."badgeReputation", 0) as "reputation"`,
          ),
        ),
    );
  });

  await knex.schema.createView('global_stats_view', view => {
    view.as(
      knex.select(
        knex('posts').where('type', 'question').count('*').as('totalQuestions'),
        knex('answers').count('*').as('totalAnswers'),
        knex('posts').where('type', 'article').count('*').as('totalArticles'),
        knex('unique_authors').count('*').as('totalUsers'),
        knex('post_views').count('*').as('totalViews'),
        knex('tags').count('*').as('totalTags'),
        knex('comments').count('*').as('totalComments'),
        knex.raw(
          `(select count(*) from answer_votes) + (select count(*) from post_votes) as "totalVotes"`,
        ),
      ),
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropView('global_stats_view');
  await knex.schema.dropView('user_stats_view');
  await knex.schema.dropTable('user_badges');
  await knex.schema.dropTable('badges');
  await knex.schema.alterTable('user_stats', table => {
    table.dropColumn('reputation');
  });
};
