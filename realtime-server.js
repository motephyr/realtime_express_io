var environment = require('./environment.js');
//var redis = environment.loadRedis();
var io = environment.loadSocketIo();

environment.authorize(io);

var express = require('express');
var app = express();
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
})

app.get('/:name', function (req, res, next) {

  var fileName = req.params.name;
  res.sendFile(__dirname + '/public/' + fileName+ '.html');
});

app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/js', express.static(__dirname + '/public/javascripts'));
app.use('/css', express.static(__dirname + '/public/stylesheets'));
app.use('/image', express.static(__dirname + '/public/images'));



app.listen(5000);
console.log('Listen Port:5000');
