// External modules
var mysql = require('mysql');
var express = require('express');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');

//User modules
var reddit = require('./reddit');

// load our API and pass it the connection


// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'cbroomhead', 
  password : '',
  database: 'reddit'
});

var redditAPI = reddit(connection);

//Create express app
var app = express();

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
          //console.log("we get inside this else from checkLoginToken")
          request.loggedInUser = user;
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
  


//Routes

/*****************************/
//SIGNUP 
app.get('/signup', function (req, res) {
  
  //console.log(res);
  
        var signupform = `
  <form action="/signup" method="POST"> 
  <h1> This is where you SIGN-UP </h1>
  <div>
    <input type="text" name="username" placeholder="Enter a username">
  </div>
  <div>
    <input type="password" name="password" placeholder="Enter a Password">
  </div>
  <button type="submit">Sign Up!</button>
</form>`;
  
  res.send(signupform);
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
        //console.log("You get into the right else.");
        //res.send("We are creating your username and password.")
        res.redirect(`/login`);
    }
  })
})


//LOGIN
app.get('/login', function (req, res) {
  
  var loginform = `
  <form action="/login" method="POST"> 
  <h1> This is where you LOGIN </h1>
  <div>
    <input type="text" name="username" placeholder="Enter a username">
  </div>
  <div>
    <input type="password" name="password" placeholder="Enter a Password">
  </div>
  <button type="submit">Login Up!</button>
</form>`;
  
  res.send(loginform);
})

app.post('/login', function(req, res) {

  redditAPI.checkLogin(req.body.username, req.body.password, function(err, login) {
    if (err) {
      console.log('please' + err.stack);
    }
    else {
     // console.log("This is the login:" + login.username + "user Id:" + login.id); //at thi spoint, the login is true. 
      //res.redirect(`/homepage`);

      redditAPI.createSession(login.id, function(err, token) {
        if (err) {
          res.status(500).send('an error occurred. please try again later!');
        }
        else {
          console.log(login.username);
          res.cookie('SESSION', token); // the secret token is now in the user's cookies!
          res.redirect('/createPost');
        }
      });
    }
  })

})

//CREATE POST
app.get('/createPost', function (req, res) {
  var posthtml = `
<form action="/createPost" method="POST"> 
  <h1> CREATE A POST </h1>
  <div>
    <input type="Post Title" name="posttitle" placeholder="Post Title">
  </div>
   <div>
    <input type="Post URL" name="posturl" placeholder="Post Url">
  </div>
  <button type="submit">Submit Post</button>
</form>
  `
  res.send(posthtml);
  
})

app.post('/createPost', function(request, response) {
  if (!request.loggedInUser) {
    // HTTP status code 401 means Unauthorized
    response.status(401).send('You must be logged in to create content!');
  }
  else {
    console.log("the createpost post work");
    redditAPI.createPost({
      title: request.body.posttitle,
      url: request.body.posturl,
    }, request.loggedInUser.id, function(err, post) {
      if(err){
        console.log(err)  
      }
      else {
        var postpage=`
  <h1>You've submitted your post!!</h1>
  <h2> Good luck with collecting votes! </h2>
  `
  response.send(postpage);
      
      }
    })
  }
})

//GO TO POST
// app.get('/post', function(request, response){
//   var postpage=`
//   <h1>You've displayed your </h1>
//   `
  
// })





/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
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







