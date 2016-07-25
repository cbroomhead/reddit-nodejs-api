
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

////////////

var express = require('express');
var app = express();


/*app.get('/calculator/:operation/:num1/:num2', function (req, res) {
    console.log(req.params, "THESE ARE THE PARAMS");
    //res.send(req.params)
    if(req.params.operation === 'add'){
        console.log("you get this far");
        res.send('' + (Number(req.params.num1) + Number(req.params.num2)));
    }
    if(req.params.operation === 'sub'){
        console.log("you get this far");
        res.send('' + (Number(req.params.num1) - Number(req.params.num2)));
    }
    if(req.params.operation === 'mult'){
        console.log("you get this far");
        res.send('' + (Number(req.params.num1) * Number(req.params.num2)));
    }
    if(req.params.operation === 'div'){
        console.log("you get this far");
        res.send('' + (Number(req.params.num1) / Number(req.params.num2)));
    }
    else{
        res.sendStatus(400);
    }
});*/

app.get('/posts', function (req, res) {
    //#1 call function getAllPosts /
    //#2 create funciton callback/
    //#3 if error, return status code /
    //#4 if no error, show all posts in html
    //#5 format in html (console.log always to see results format)
    
   redditAPI.getAllPosts ('controversial', function(err, posts) {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      }
      else {
       
       function createLi(post){
        return `
        <li>
          <h2> Post Title: ${post.title} </h2>
          <a href="${post.url}">Go to url ${post.url}</a>
          <p>Post userId: ${post.user.username}</p>
          <p>Post created at: ${post.user.createdAt}</p>
        </li>
        
       
        
        `;  
       }
       
        var html = `
        <div id="contents">
          <h1>List of contents</h1>
            <ul class="contents-list">
             ${posts.map(function(post){
               return createLi(post);
             }).join("")}
            </ul>
        </div>
        `;        
        
        
        res.send(html);
        
      }
})
})


    








/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

