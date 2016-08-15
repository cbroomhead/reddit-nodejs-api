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

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

  
// redditAPI.checkLogin ('hello', 'kitty', function(err, post){
//   if (err){
//     console.log(err.stack);
//   }
//   else {
//     console.log(post);
//   }
// })


  
// redditAPI.createSession (15, function(err, post){
//   if (err){
//     console.log(err.stack);
//   }
//   else {
//     console.log(post);
//   }
// })


// var token ='71155j364m6j3o2z125l368714o4d2r5d4h471n2y4c266i3v3w3j4j123rfu5l4x5s2gb2q6g3e3ks2p5v06x1o512v4ld4v182o13711c823e5v5476l3b4i6m5p5p6k13s4e4t68503v6f255341a5x272h96x1s533i2q566z6g6621g4a3e';
// //checkLoginToken(request, response, next)
// redditAPI.checkLoginToken (token, function(err, post){
//   if (err){
//     console.log(err.stack);
//   }
//   else {
//     console.log(post);
//   }
// })


// //(body, postId, parentId, userId) 
// redditAPI.createComment ({
//   body: "blah blah blah",
//   postId: 108,
//   //parentId: 'NULL',
//   userId: 21
//   }, function (err, comment){
//     if(err){
//       console.log(err);
//     }
//     else {
//       console.log(comment);
//     }
//   })


//getSinglePost: function (postId, callback)
redditAPI.getCommentsForPost (107, function (err, comment){
    if(err){
      console.log(err);
    }
    else {
      console.log(comment);
    }
  })
  
 //    <pre><%=JSON.stringify(comments, null, 4)%></pre>


//this goes  in between the ul 
     <% comments.forEach(function(comment) { %>
        <li>
            <p>
                <%=comment.body%>
            </p>
            <% if(comment.replies) { %>
                <% comment.replies.forEach(function(reply) { %>
                    <p>-->
                        <%=reply.body%>
                    </p>
                    <% }) %>
                       <% } %>
                            <hr width=90%>
        </li>
       <% }) %>
  
 
  
  