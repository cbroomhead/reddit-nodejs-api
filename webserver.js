
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
var bodyParser = require('body-parser');


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


app.get('/createContent', function (req, res){
  var htmlform = `
  <form action="/createContent" method="POST"> 
  <div>
    <input type="text" name="url" placeholder="Enter a URL to content">
  </div>
  <div>
    <input type="text" name="title" placeholder="Enter the title of your content">
  </div>
  <button type="submit">Create!</button>
</form>`;
  
  res.send(htmlform);
})

app.use(bodyParser.urlencoded({
    extended: false
  }));

app.post('/createContent', function(req, res) {

  //console.log(req.body);
  console.log(req.body.url);
    console.log(req.body.title);
  
  redditAPI.createPost({
    title: req.body.title,
    url: req.body.url,
    userId: 8
    
  }, 4, function(err, post) {
    if (err) {
      console.log(err);
    }

    else {
      //console.log(post)
      res.send("I've got your data (I think)")
    }
  });

})

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

