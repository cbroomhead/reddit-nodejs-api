var express = require('express');
var app = express();

//https://reddit-nodejs-api-cbroomhead.c9users.io/hello?name=John
/*app.get('/user/:id', function(req, res) {
  res.send('user ' + req.params.id);
});*/

app.get('/calculator/:operation/:num1/:num2', function (req, res) {
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
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

