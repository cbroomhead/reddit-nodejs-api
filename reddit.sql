-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(60) NOT NULL, 
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(300) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
--

INSERT INTO `users` (`id`,`username`,`password`,`createdAt`,`updatedAt`) VALUES 
(11,"Hiroko","4531","2016-09-10 13:04:21","2016-10-15 02:11:23"),
(12,"Sylvia","9488","2017-03-31 23:01:20","2016-03-05 07:20:15"),
(13,"Lysandra","5718","2016-09-04 19:01:47","2016-06-01 16:28:50"),
(4,"Shannon","7929","2015-08-20 18:12:24","2016-10-23 03:08:18"),
(5,"Jakeem","6450","2015-08-13 08:27:00","2017-03-08 13:59:17"),
(6,"Athena","7661","2016-05-30 06:02:20","2016-04-24 02:57:04"),
(7,"Charles","3695","2015-11-24 13:56:52","2017-05-22 07:32:18"),
(8,"Wanda","8719","2015-08-09 11:30:15","2015-08-06 01:40:00"),
(9,"Hayfa","8354","2015-11-10 17:26:03","2015-09-17 11:10:03"),
(10,"Georgia","7156","2017-02-21 19:25:55","2016-06-07 06:00:08");
    
    
    

INSERT INTO posts (title, url, userId, createdAt, updatedAt) VALUES 
("I like cats", "www.cutecats.com", "1", "2016-07-02", "2016-07-02"),
("I like dogs", "www.cutedogs.com", "2", "2016-07-03", "2016-07-04"),
("I like swimming", "www.notphelps.com","3", "2016-07-04", "2016-07-05"),
("I like traveling", "www.cuteplaces.com","4",  "2016-07-04", "2016-07-04"),
("I like water", "www.deliciouswater.com","5", "2016-07-03", "2016-07-04"),
("I like eating", "www.imfat.com",  "2016-07-09","6", "2016-07-09"),
("I like sleeping", "www.lazyass.com",  "2016-07-10","7", "2016-07-10");



--Creating the table called subreddits
CREATE TABLE `subreddits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) DEFAULT NULL,
  `description` text(200) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` timestamp,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) 

INSERT INTO subreddits (name, description, createdAt) VALUES 
('apple', 'for mac and iphone lovers', "2016-07-10"),
('crossfit', 'for crossfit doers', "2016-07-11"),
('news', 'to stay current on news', "2016-07-12"),
('aww', 'to look at cute animals', "2016-07-13"),
('wtf', 'for NSFL content', "2016-07-14");


--Adding the Step 2
--Then we need to add a subredditId column to the posts table, with associated foreign key. Once you figure out the correct 
--ALTER TABLE statement, make sure to add it to reddit.sql with a comment.

ALTER TABLE posts
ADD subreddits_id INT, 
ADD FOREIGN KEY (`subreddits_id`) 
REFERENCES `subreddits` (`id`) ON DELETE SET NULL


--Adding the comments Table

CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `body` text(10000) DEFAULT NULL, 
  `postId` INT DEFAULT NULL,
  `createdAt` TIMESTAMP,
  `updatedAt` TIMESTAMP,
  `parentId` INT DEFAULT NULL,
  `userId` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--Adding foreign keys to the comments table

ALTER TABLE comments
ADD FOREIGN KEY (`userId`)
REFERENCES `users` (`id`) ON DELETE SET NULL

--Adding the postID using a JOIN
--SELECT * FROM [table1] INNER JOIN [table2] ON [table1].[column] = [table2].[column];

SELECT posts.id FROM posts JOIN comments ON posts.id = comments.postId;

ALTER TABLE comments
ADD FOREIGN KEY (`parentId`)
REFERENCES `comments` (`id`) ON DELETE SET NULL

UPDATE comments
SET parentId = NULL
WHERE parentId = 40;

UPDATE comments
SET postId = 40 
WHERE postId = 0;

--creating the votes table

CREATE TABLE `votes` (
  `postId` INT(11),
  `userId` INT(11) ,
  `vote` TINYINT, 
  `createdAt` DATETIME, 
  `updatedAt` TIMESTAMP, 
  PRIMARY KEY (`postId`, `userId` )
) DEFAULT CHARSET=utf8;


ALTER TABLE votes 
ADD FOREIGN KEY (`postID`) 
REFERENCES `posts` (`id`) 


ALTER TABLE votes 
ADD FOREIGN KEY (`userID`) 
REFERENCES `users` (`id`) 


--UPDATE my_table SET my_column='new value' WHERE something='some value';
UPDATE posts
SET subreddits_id = '7'
WHERE id = '23';

INSERT INTO
posts(title, url, userId, createdAt, subreddits_id)
VALUES
  ("Chocolate is my favorite", "www.seescandy.com",12, "2016-07-13", 5),
  ("Who likes to cook", "www.juliachilds.com",13,  "2016-07-01", 2),
  ("Gardening is relaxing", "www.greenjeans.com",8,   "2016-07-11", 2),
  ("Let's get outdoors", "www.rei.com",11, "2016-07-13", 8),
  ("My grandma knits", "www.uglysweaters.com",16, "2016-06-13", 3),
  ("Let's get outdoors", "www.rei.com",18, "2015-08-13", 8);
  
CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) DEFAULT NULL,
  `userId` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE sessions
ADD userId INT(11)

ALTER TABLE sessions
ADD FOREIGN KEY (`userId`)
REFERENCES `users` (`id`) ON DELETE SET NULL

DELETE FROM subreddits WHERE id = 6

UPDATE posts 
    SET subreddits_id = 8
    WHERE id > 86;
    
    

INSERT INTO 
  votes (postId, userId, vote, createdAt)
VALUES
       (107, 16, 1, 2016-07-02),
         (107,18, 1, 2016-07-02),
     (107, 20, 1, 2016-07-02),
      (107,23, 1, 2016-07-03),
       (107,26, 1, 2016-07-02),
        (107,27, 1, 2016-07-02),
    (107, 32, 1, 2016-07-01),
     (107, 34, -1, 2016-07-01),
      (107,37, 1, 2016-07-01),
       (107,38, -1, 2016-07-01),
       (107,39, 1, 2016-07-01),
       (107, 40,1, 2016-07-01),
       (107,41, 1, 2016-07-01),
        (107, 42,1, 2016-07-01);
       
  
  SELECT 
          p.id as postId, username, p.title, p.url, p.createdAt 
        FROM 
          posts as p
        JOIN users AS u ON p.userId = u.id
        JOIN subreddits AS s ON p.subreddits_id = s.id
        LEFT JOIN votes AS v ON p.id = v.postId 
        GROUP BY p.id
        ORDER BY p.createdAt DESC

DELETE
FROM sessions
WHERE token = '1k6750w4d4623v2w1f53426u4f4s3v3l573f4jk05s5505n431x3l4259u3y513b1e2yz5z3c1w5n5o19b40266w6a7133n142p246w5b4i3958s23q6756c2f3x4r723y2d5k2747x6r3g31f5k6h6s5s601m5602f4w3r5q4c4p3767r205cl'    
 
INSERT INTO 
  comments (body, postId, createdAt, parentId, userId)
VALUES
    ("ribs salami bacon, meatloaf capicola", 107, 2016-07-28, 32, 21 ),
    ("salami ball tip. Tail ", 107, 2016-07-28, 32, 25 ),
    ("tongue biltong pork ribeye pork loin turducken jowl", 107, 2016-07-28, 32, 27 ),
    ("Tongue ball tip beef ribs pork chop meatball ", 107, 2016-07-28, 38, 31),
    ("cupim cow short ribs t-bone fatback.", 107, 2016-07-28, 39, 33 ),
    ("Brisket turkey cow, shoulder spare ribs", 107, 2016-07-28, 41, 35 ),
    ("turkey meatloaf t-bone drumstick alcatra", 107, 2016-07-28, 32, 20 );
    
    
    
    
    
    
    




  



