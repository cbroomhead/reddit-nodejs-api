// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'cbroomhead', 
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);


//It's request time!
// function userCreatesPost() {

// redditAPI.createUser({
//   username: 'wildOperation',
//   password: 'secret4'
// }, function(err, user) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     //console.log(user)
//     redditAPI.createPost({
//       title: 'I hate google',
//       url: 'https://www.googlesucks.com',
//       userId: user.id
//     }, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });
//   }
// });
// }

// userCreatesPost();


//function(options, callback)
// redditAPI.getAllPosts (function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
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








