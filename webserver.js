
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


app.get('/calculator/:operation/:num1/:num2', function (req, res) {
    console.log(req.params, "THESE ARE THE PARAMS");
    //res.send(req.params)
    if(req.params.operation === 'add'){
        console.log("you get this far");
        res.send('' + (parseInt(req.params.num1) + parseInt(req.params.num2)));
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
});

app.get('/posts', function (req, res) {
  redditAPI.getAllPosts ('controversial', function(err, posts) {
      if (err) {
        console.log(err.stack);
        res.sendStatus(403).send("Try again later");
      }
      else {
       function createLi(post) {
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

app.get('/posts/:id', function(req, res) {
      var postId = req.params.id;
      redditAPI.getSinglePost(postId, function(err, singlePost) {

        if (err) {
          res.status(500).send("try again later");
          console.log(err.stack);
        }
        else {
          var singleHtml = `
        <div id="contents">
          <h1>List of contents</h1>
            <ul class="contents-list">
        <li>
          <h2> Post Title: ${singlePost[0].title} </h2>
          <a href="${singlePost[0].url}">Go to url ${singlePost[0].url}</a>
          <p>Post userId: ${singlePost[0].userId}</p>
          <p>Post id: ${singlePost.id}</p>
          
        </li>
          </ul>
        </div>`;
         
        }
         res.send(singleHtml);

      })
})

app.post('/createContent', function(req, res) {

  //console.log(req.body);
  //console.log(req);
  
  redditAPI.createPost({
    title: req.body.title,
    url: req.body.url,
    subId: req.body.subId,
    userId: 8
    
  }, req.body.id, function(err, post) {

    if (err) {
      console.log(err);
    }

    else {
      
      //res.send("I've got your data (I think)") getSinglePost: function (postId, callback) 
      res.redirect(`/posts/${post.id}`);
      
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

