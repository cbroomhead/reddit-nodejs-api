var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
var secureRandom = require('secure-random');

function createSessionToken(){
    return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
}

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
            
            conn.query(
              'SELECT id, title, url, userId, createdAt, updatedAt, subreddits_id FROM posts WHERE id = ?', [result.insertId],
              
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  //console.log(result);
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getAllPosts: function(sortingMethod, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
    var groupedby;   
      if(sortingMethod === 'new'){
        groupedby = 'p.createdAt DESC';
      }
      if(sortingMethod === 'top'){
        groupedby = 'votescore';
      }
      if(sortingMethod === 'hot'){
        console.log("this is the hot post")
        groupedby ='longestpost'
      }
      
//Controversial ranking: = numUpvotes < numDownvotes ? totalVotes * (numUpvotes / numDownvotes) : totalVotes * (numDownvotes / numUpvotes)
      if (sortingMethod === 'controversial'){
         groupedby= `
         if((count(if(vote=1, 1, null))>count(if(vote=-1, 1, null))),(sum(vote) * count(if(vote=1, 1, null))) / count(if(vote=-1, 1, null)),null)`;
      }
      
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      conn.query(`
        SELECT 
          username, u.id, p.title, p.url, p.createdAt , p.updatedAt, p.userId, sum(v.vote) as votescore , 
          (now() - p.createdAt) as longestpost
        FROM 
          posts as p
        JOIN users AS u ON p.userId = u.id
        JOIN subreddits AS s ON p.subreddits_id = s.id
        LEFT JOIN votes AS v ON p.id = v.postId 
        GROUP BY p.id
        ORDER BY ${groupedby} 
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
                },
                voteScore: obj.votescore
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
            SELECT 
              posts.title, posts.url, posts.userId, users.username
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
     
      
    },
    createComment: function(comment, callback) {
      /*
      if(!comment.UserId || !comment.postId ){
        call(null, new Error ('user and postsId required'));
        return;
      }
      if(!comment.parentId){
        comment.parentId = null;
      }
      
      */
      
      conn.query(
        `INSERT INTO comments 
          (body, postId, parentId, userId) 
        VALUES 
          (?,?,?,?)`, 
          [comment.body, comment.postId, comment.parentId, comment.userId],
        function(err, comment) {
          if (err) {
            console.log(err)
          }
          else {
            console.log('I get inside the else statement');
            conn.query(
              `SELECT 
                id, body, userId 
              FROM 
                comments WHERE id=?`, [comment.insertId],
              function(err, result) {
                if (err) {
                  console.log(err)
                }
                else {
                  callback(null, result);
                }
              })
          }
        })
    },
    /* getCommentsForPost: function(postId, callback) {
        conn.query(
          `
        SELECT 
          c1.id as c1_id, c1.body as c1_body, c1.parentId as c1_parentId, 
          c2.id as c2_id, c2.body as c2_body, c2.parentId as c2_parentId,
          c3.id as c3_id, c3.body as c3_body, c3.parentId as c3_parentId
        FROM comments c1
        LEFT JOIN comments c2 ON c1.id = c2.parentId
        LEFT JOIN comments c3 ON c2.id = c3.parentId
        WHERE c1.parentId IS NULL AND c1.postId = ?
        `, [postId],
          function(err, allcomments) {
            if (err) {
              //callback(err);
              console.log(JSON.stringify(comments, null, 4));
            }
            else {
              // var mappedAllComments = allcomments.map (function (obj){
              //   return {
              //     id: obj.id,
              //     body: obj.body,
              //     //createdAt: obj.createdAt,
              //     //updatedAt: obj.updatedAt,
              //     replies: []
              //   }
              // })

              var finalCommentsArray = [];
              var coomentsIndex = {};

              allcomments.forEach(function(item) {
                  var comment1;
                  if (commentsIndex[item.c1_id]) {
                    comment1 = commentsIndex[item.c1_id]
                  }
                  else {
                    var comment1 = {
                      id: item.c1_id,
                      body: item.c1_body,
                      parentId: item.c1_parentId,
                      replies: []
                    };
                    //put the commentin theindes by it's id
                    commentsIndex[commentGroup.c1_id] = comment1;
                    //put it in the final comments araay 
                    finalComments.push(comment1)
                  }

                  //there is an if statement here. 

                  var comment2;
                  if (commentsIndex[item.c2_id]) {
                    comment1 = commentsIndex[item.c1_id]
                  }
                  else {
                    var comment2 = {
                      id: item.c2_id,
                      body: item.c2_body,
                      parentId: item.c2_parentId,
                      replies: []
                    };
                    //put the commentin theindes by it's id
                    commentsIndex[commentGroup.c1_id] = comment2;
                    //put it in the final comments araay 
                    comment1.replies.push(comment2)
                  }

                  if (item.c3_id !== null) {

                    comment2.replies.push( = {
                      id: item.c3_id,
                      body: item.c3_body,
                      parentId: item.c3_parentId,
                      replies: []
                    });
                  }

                }
                console.log(comment1, comment2, comment3); console.log("-------------");

              });


          }

        })//there is a function here!!! **********DO NOT DELETE*/
    createOrUpdateVote: function(vote, callback) {
     
      if (vote.vote === 1 || vote.vote === -1 || vote.vote === 0) {
        console.log(vote);
        
        conn.query(
          'INSERT INTO `votes` SET `postId`= ? , `userId`= ?, `vote`= ?, `createdAt`= ? ON DUPLICATE KEY UPDATE `vote`= ?;',[vote.postId , vote.userId, vote.vote, new Date(), vote.vote],
          function(err, voice) {
            if (err) {
              callback(err);
            }
            else {
              callback(null, voice);
            }
          })
      }
      else {
        console.log("please enter a valid vote");
      }
    
    },
    checkLogin: function(username, password, callback) {
          conn.query(
            `SELECT
              u.username, u.password, u.id
            FROM
              users AS u
            WHERE u.username = ?
            `, [username],
            function(err, res) { //res is array
              if (err) {
                console.log("there was an error with your query")
              }
              else {
                //console.log("I am console login here:" + res[0].username)
                var user = res[0];
                
                  if(res.length === 0){
                    console.log("there was an err, please try again. Redirect to login.")
                  }
                  else {
                   // console.log(res[0])
                    if(res[0].password){
                      bcrypt.compare(password, res[0].password, function(err, res) {
                        if(err){
                          console.log(err)
                        }
                        else{
                          console.log(user)
                          callback(null, user)
                        }
                      }) 
                    }  
                  }
              }
            }
          )
      },
    createSession: function(userId, callback){
     var token = createSessionToken();
      conn.query('INSERT INTO sessions SET userId = ?, token = ?', [userId, token], function(err, result) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, token); // this is the secret session token :)
    }
  }) 
    },
    getUserFromSession: function (token, callback){
      console.log(token);
      conn.query(`
        SELECT 
          token , userId
        FROM 
          sessions 
        LEFT JOIN users 
          ON sessions.userId = users.id
        WHERE 
          token = ?
        `, [token], function(err, res){
          if(err){
            console.log(err)
          }
          else{
            callback(null, res);
          }
        }
    )}
 
    
    
    

    
  }
}
/*
SELECT token
FROM sessions
LEFT JOIN users
ON sessions.userId = users.id

table1.column_name=table2.column_name;
*/
    
