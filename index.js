// External modules
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var cheerio = require('cheerio');
var request = require("request");


//User modules
var reddit = require('./reddit');


// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'cbroomhead',
  password: '',
  database: 'reddit'
});

// load our API and pass it the connection
var redditAPI = reddit(connection);

//load the ejs mate for loading partials
var engine = require('ejs-mate');

//Create express app
var app = express();

app.locals.formatDate = formatDate;
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);


//Middleware
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser())

function checkLoginToken(request, response, next) {
  if (request.cookies.SESSION) {
    redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
      if (err) {
        console.log(err.stack)
      }
      else {
        if (user) {
          request.loggedInUser = user; //user is an object with token and user Id
          response.locals.loggedIn = user;
        }
        next();
      }
    });
  }
  else {
    next();
  }
}

app.use(checkLoginToken);

app.use(express.static('public'));

//Linking to the css file
app.use('/files', express.static(__dirname + '/public'));



//Helper Functions
function formatDate(dateString) {
  var year = new Date(dateString).getFullYear();
  var month = new Date(dateString).getMonth();
  var day = new Date(dateString).getDay();

  if (month < 10) {
    month = `0${month}`
  }
  if (day < 10) {
    day = `0${day}`
  }

  return `${year}/${month}/${day}`

}

//Routes
/*****************************/
//HOMEPAGE

app.get('/', function(req, res) {
  if (req.query.sorting) {
    var sort = req.query.sorting;
  }
  redditAPI.getAllPosts(req.query.sorting, function(err, posts) {
    if (err) {
      console.log(err.stack);
      res.sendStatus(403).send("Try again later");
    }
    else {
      
      
      res.render('homeview', {
        posts: posts,
        loggedIn: req.loggedInUser,
        sort: sort
      })
      

    }
  })
})


//SIGNUP 
app.get('/signup', function(req, res) {

  res.render('signupview')

})

app.post('/signup', function(req, res) {

  redditAPI.createUser({
    username: req.body.username,
    password: req.body.password
  }, function(err, post) {

    if (err) {
      res.status(500).send("try again later1");
      console.log(err.stack);
    }

    else {
      res.status(200).send('success');
    }
  })
})


//LOGIN
app.get('/login', function(req, res) {
  console.log(res)

  res.render('loginview')
})

app.post('/login', function(req, res) {
  
  console.log(req.body);
  
  redditAPI.checkLogin(req.body.username, req.body.password, function(err, login) {
    if (err || !login) {
      res.send('error')
    }
    else {
      redditAPI.createSession(login.id, function(err, token) {
        if (err) {
          res.send('error');
        }
        else {
          res.cookie('SESSION', token); // the secret token is now in the user's cookies!
          res.status(200).send('success');
        }
      });
    }
  })

})


//CREATE POST
app.get('/createPost', function(req, res) {
  res.render('createpostview')

})

app.post('/createPost', function(req, res) {
  if (!req.loggedInUser) {
    res.status(401).send('You must be logged in to create content!');
  }
  else {

    redditAPI.createPost({
      title: req.body.posttitle,
      url: req.body.posturl,
      userId: req.loggedInUser[0].userId,
    }, 3, function(err, post) {
      if (err) {
        console.log(err)
      }
      else {
        //response.redirect('/');
      res.status(200).send('success')
      
      }
    })
  }
})


//VOTE
app.post('/vote', function(req, res) {
  if (req.query.sort) {
    var sort = req.query.sort;
  }
  if (!req.loggedInUser) {
    res.status(401).send('You must be logged in to create content!');
  }
  else {
    //console.log(req.body)
    redditAPI.createOrUpdateVote(req.body, req.loggedInUser[0].userId, function(err, voteUpdate) {
      if (err) {
        console.log(err)
      }
      else {
        redditAPI.getVotesForPost(req.body.postId, function (err, response){
          if(err){
            res.send(err);
          }
          else {
            res.send({votescore: response});
          }
        })
        
        
        // var path = '/'; //deafult
        // if (sort) {
        //   path = `/?sorting=${sort}`
        // }

        // res.redirect(path);
      }
    })
  }
})


//LOGOUT
app.get('/logout', function(req, res) {
  if (!req.loggedInUser) {
    console.log("you may not be logged in")
  }
  else {
    // console.log(req.loggedInUser)
    var cookie = req.loggedInUser[0].token;

    redditAPI.deleteSession(cookie, function(err) {
      if (err) {
        console.log(err)
      }
      else {
        res.clearCookie('SESSION').redirect('/');
      }

    })
  }
})

app.get('/logout', function(req, res) {
  res.render('singlepost')
  console.log("we are getting the to .get of the comments")

})


//SINGLE POST PAGE

app.get('/singlepost/:postId', function(req, res) {


  redditAPI.getSinglePost(req.params.postId, function(err, post) {
    if (err) {
      console.log(err.stack);
      res.sendStatus(403).send("Try again later");
    }
    else if (!post) {
      res.sendStatus(404).send('Not Found');
    }
    else {
      redditAPI.getCommentsForPost(req.params.postId, function(err, comments) {
        if (err) {
          console.log(err.stack);
          res.sendStatus(403).send("Try again later");
        }
        else {
          res.render('singlepost', {
            comments: comments,
            loggedIn: req.loggedInUser,
            post: post
          });
        }
      })

    }

  })


})


//SUGGEST TITLE

app.post('/suggestTitle', function (req, res) {

  request(req.body.url, function(err, html){
    if(err){
      console.log(err);
    }
    else{
        var $ = cheerio.load(html.body);
        res.send($('title').text())
    }   
  })
})




//SECRET PAGE
// app.get('/secret', function(req, res) {
//   if (!req.loggedInUser) {
//     console.log("you may not be logged in");
//   }
//   else {
//         res.render('secretview');
//       }
// })

/*****************************/
/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerpslate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


//function userCreatesPost() {
// redditAPI.createUser({
//   username: 'wildOperation',
//   password: 'secret4'
// }, function(err, user) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//console.log(user)
//     redditAPI.createPost({
//       title: 'Chocolate is my favorite',
//       url: 'www.seescandy.com  ',
//       userId: user.id
//     }, 4, function(err, post) {
//       if (err) {
//         console.log(err);
//       }

//       else {
//         console.log(post);
//       }
//     });
//   //}
// //});
// //}

// userCreatesPost();


//function(options, callback)
// redditAPI.getAllPosts ('controversial', function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//         connection.end();
//       }
// });


//getAllPostsForUser: function(userId, options, callback) 
// redditAPI.getAllPostsForUser(16, function(err, post) {
//   if(err){
//     console.log(err);
//   }
//   else {
//     console.log(post);
//   }
// });

//


//getSinglePost: function (postId, callback)
// redditAPI.getSinglePost( 38, function(err, post){
//   if(err){
//     console.log(err);
//   }
//   else {
//     console.log(post);
//   }
// })

// redditAPI.createSubreddit ('worldnews', function(err, post){
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(post);
//   }
// })

// redditAPI.createSubreddit({
//       name: 'worldnews',
//       description: 'read about horrible shit happening',
//     }, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });


// redditAPI.getAllSubreddits (function (err, post){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log(post);
//   }
// })

// redditAPI.createPost({
//   title: 'My cat is the cutest',
//   url: 'imgur.cutecat.com',
//   userId: 16
// }, 4, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });


// redditAPI.createComment ({
//   body: "look at the katana",
//   postId: 40,
//   parentId: 16,
//   userId: 6
//   }, function (err, comment){
//     if(err){
//       console.log(err);
//     }
//     else {
//       console.log(comment);
//     }
//   })

// redditAPI.getCommentsForPost (40, function (err, arraycomments){
//   if (err){
//     console.log(err)
//   }
//   else {
//     console.log(arraycomments) //this return an array
//   }
// })



// var voteObj ={
//     postId: 40,
//     userId : 9,
//     vote : 1
// }
//This function will take a vote object with postId, userId, vote.
// redditAPI.createOrUpdateVote (voteObj, function (err, result){
//   if (err){
//     console.log(err)
//   }
//   else {
//     console.log(result) //this return an array
//     connection.end();
//   }
// })



//getAllPosts: function(options, sortingMethod, callback)






//connection.end(); this will close the connection
