var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                      callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },  
    createPost: function(post, subID, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt, subreddits_id) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), subID],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            console.log("i get here");
            conn.query(
              'SELECT id, title, url, userId, createdAt, updatedAt, subreddits_id FROM posts WHERE id = ?', [result.insertId],
              
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    //In the reddit.js API, modify the getAllPosts function to return the full subreddit associated with each post. 
    //You will have to do an extra JOIN to accomplish this.
    getAllPosts: function(options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      conn.query(`
        SELECT username, p.title, p.url from posts as p
        JOIN users as u on p.userId = u.id
        JOIN subreddits as s on p.subreddits_id = s.id
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?`, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var mappedResults = results.map(function(obj) {
              return {
                id: obj.id,
                title: obj.title,
                url: obj.url,
                createdAt: obj.createdAt,
                updatedAt: obj.updatedAt,
                userId: obj.userId,
                user: {
                  id: obj.id,
                  username: obj.username,
                  createdAt: obj.createdAt,
                  updatedAt: obj.updatedAt
                }
              }
            })

            callback(null, mappedResults);
          }
        }
      );
    },
    getAllPostsForUser: function(userId, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      } else {}

        var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
        var offset = (options.page || 0) * limit;

        conn.query(`
            SELECT posts.title, posts.url, posts.userId, users.username
            FROM posts
            JOIN users ON posts.userId = users.id 
            WHERE posts.userId = ?
            ORDER BY posts.createdAt DESC
            LIMIT ? OFFSET ?`, [userId, limit, offset],
          function(err, results) {

            if (err) {
              callback(err);
            }
            else {
              callback(null, results);
            }
          }
        );
      
    },
    getSinglePost: function (postId, callback) {
      if (!callback) {
        console.log("there was an error");
      }
      else {
        conn.query(`
            SELECT id, title, url, userId
            FROM posts
            WHERE posts.id = ?
            ORDER BY posts.createdAt DESC
            `, [postId],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              callback(null, results);
            }
          }
        );
      }
    },
    createSubreddit: function (sub, callback){
    conn.query(
        'INSERT INTO subreddits (id, name, description, createdAt) VALUES (?, ?, ?, ?)', [sub.id, sub.name, sub.description, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            conn.query(
              'SELECT id, name, description, createdAt FROM subreddits WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result);
                }
              })
          }
        })
    },
    getAllSubreddits: function (callback){
     conn.query(
      'SELECT name, description, createdAt from subreddits ORDER BY subreddits.createdAt DESC', function (err, result){
        if(err){
          callback(err);
        }
        else{
          callback(null, result);
        }
      }
       )
     
      
    }
  }
}
