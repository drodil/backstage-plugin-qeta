--- Questions
INSERT INTO posts (author, title, content, created, anonymous, type) VALUES
    ('user:default/john.doe',
     'How can I fix a "TypeError: ''NoneType'' object is not iterable" in Python?',
     'I am trying to iterate over a list in Python, but I get a TypeError: ''NoneType'' object is not iterable. How can I fix this?',
     CURRENT_DATE - 2,
     false,
     'question'
    );

INSERT INTO posts (author, title, content, created, anonymous, type) VALUES
    ('user:default/jane.doe',
     'Why is my CSS flexbox not centering items vertically?',
     'I''m trying to center some items vertically within a div using CSS Flexbox, but it''s not working as I expected.',
     CURRENT_DATE - 1,
     false,
     'question'
    );

INSERT INTO posts (author, title, content, created, anonymous, type) VALUES
    (
     'user:default/john.doe',
     'What is the meaning of life?',
     'I''ve been pondering this question for a while now, and I''m curious to hear what others think.',
     CURRENT_DATE,
     false,
        'question'
    );

INSERT INTO answers ("postId", author, content, correct, created, anonymous) VALUES (3,
                                                                                       'user:default/jane.doe',
                                                                                       'The meaning of life is a philosophical question that has been debated for centuries. Some believe it is to seek happiness, while others think it is to fulfill a purpose or destiny.',
                                                                                       false,
                                                                                       CURRENT_DATE,
                                                                                       false);
INSERT INTO global_stats ("totalViews", "totalQuestions", "totalAnswers", "totalTags", "totalComments", "totalUsers", "totalVotes", date) VALUES (20, 6, 3, 12, 16, 4, 2, CURRENT_DATE - 1);
INSERT INTO global_stats ("totalViews", "totalQuestions", "totalAnswers", "totalTags", "totalComments", "totalUsers", "totalVotes", date) VALUES (8, 3, 1, 4, 6, 3, 1, CURRENT_DATE - 2);