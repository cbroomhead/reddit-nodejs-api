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

ALTER TABLE posts
ADD subreddits_id INT, 
ADD FOREIGN KEY (`subreddits_id`) 
REFERENCES `subreddits` (`id`) ON DELETE SET NULL