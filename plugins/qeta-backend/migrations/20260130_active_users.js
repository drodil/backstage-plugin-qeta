exports.up = async function up(knex) {
  await knex.schema.alterTable('global_stats', table => {
    table.integer('activeUsers').defaultTo(0);
  });

  await knex.schema.dropViewIfExists('user_stats_view');
  await knex.schema.dropViewIfExists('global_stats_view');
  await knex.schema.dropView('unique_authors');

  // Fix the unique authors to also count comments/voters/viewers. Requires
  // to recreate the global_stats_view and user_stats_view
  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('comments').select('author'),
        knex('post_views').select('author'),
        knex('post_votes').select('author'),
        knex('answer_votes').select('author'),
      ]),
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

  const answerScores = knex('answers')
    .join('answer_votes', 'answers.id', 'answer_votes.answerId')
    .select('answers.author')
    .sum('answer_votes.score as answerScore')
    .groupBy('answers.author')
    .as('ans');

  const postScores = knex('posts')
    .join('post_votes', 'posts.id', 'post_votes.postId')
    .select('posts.author')
    .sum('post_votes.score as postScore')
    .groupBy('posts.author')
    .as('ps');

  const correctAnswers = knex('answers')
    .select('author')
    .where('correct', true)
    .count('* as correctAnswers')
    .groupBy('author')
    .as('ca');

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
        .leftJoin(answerScores, 'unique_authors.author', 'ans.author')
        .leftJoin(postScores, 'unique_authors.author', 'ps.author')
        .leftJoin(correctAnswers, 'unique_authors.author', 'ca.author')
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
          knex.raw('COALESCE(ans."answerScore", 0) as "answerScore"'),
          knex.raw('COALESCE(ps."postScore", 0) as "postScore"'),
          knex.raw('COALESCE(ca."correctAnswers", 0) as "correctAnswers"'),
          knex.raw(
            `(COALESCE(q."totalQuestions", 0) * 20) + (COALESCE(a."totalAnswers", 0) * 20) + (COALESCE(ar."totalArticles", 0) * 15) + (COALESCE(l."totalLinks", 0) * 10) + (COALESCE(c."totalComments", 0) * 3) + ((COALESCE(av."answerVotes", 0) + COALESCE(pv."postVotes", 0)) * 2) + (COALESCE(v."totalViews", 0) / 100) + COALESCE(b."badgeReputation", 0) + COALESCE(ans."answerScore", 0) + COALESCE(ps."postScore", 0) + (COALESCE(ca."correctAnswers", 0) * 15) as "reputation"`,
          ),
        ),
    );
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropViewIfExists('user_stats_view');
  await knex.schema.dropViewIfExists('global_stats_view');
  await knex.schema.dropView('unique_authors');

  await knex.schema.createView('unique_authors', view => {
    view.columns(['author']);
    view.as(
      knex.union([
        knex('posts').select('author'),
        knex('answers').select('author'),
        knex('comments').select('author'),
        knex('post_views').select('author'),
      ]),
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

  const answerScores = knex('answers')
    .join('answer_votes', 'answers.id', 'answer_votes.answerId')
    .select('answers.author')
    .sum('answer_votes.score as answerScore')
    .groupBy('answers.author')
    .as('ans');

  const postScores = knex('posts')
    .join('post_votes', 'posts.id', 'post_votes.postId')
    .select('posts.author')
    .sum('post_votes.score as postScore')
    .groupBy('posts.author')
    .as('ps');

  const correctAnswers = knex('answers')
    .select('author')
    .where('correct', true)
    .count('* as correctAnswers')
    .groupBy('author')
    .as('ca');

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
        .leftJoin(answerScores, 'unique_authors.author', 'ans.author')
        .leftJoin(postScores, 'unique_authors.author', 'ps.author')
        .leftJoin(correctAnswers, 'unique_authors.author', 'ca.author')
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
          knex.raw('COALESCE(ans."answerScore", 0) as "answerScore"'),
          knex.raw('COALESCE(ps."postScore", 0) as "postScore"'),
          knex.raw('COALESCE(ca."correctAnswers", 0) as "correctAnswers"'),
          knex.raw(
            `(COALESCE(q."totalQuestions", 0) * 20) + (COALESCE(a."totalAnswers", 0) * 20) + (COALESCE(ar."totalArticles", 0) * 15) + (COALESCE(l."totalLinks", 0) * 10) + (COALESCE(c."totalComments", 0) * 3) + ((COALESCE(av."answerVotes", 0) + COALESCE(pv."postVotes", 0)) * 2) + (COALESCE(v."totalViews", 0) / 100) + COALESCE(b."badgeReputation", 0) + COALESCE(ans."answerScore", 0) + COALESCE(ps."postScore", 0) + (COALESCE(ca."correctAnswers", 0) * 15) as "reputation"`,
          ),
        ),
    );
  });

  await knex.schema.alterTable('global_stats', table => {
    table.dropColumn('activeUsers');
  });
};
