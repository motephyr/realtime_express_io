// Server side use socket.io & express
var environment = require('./environment.js');
//var redis = environment.loadRedis();
var io = environment.loadSocketIo();
var uuid = require('node-uuid');
environment.authorize(io, uuid);

var path = require('path');
var proxy = require('express-http-proxy');
var express = require('express');
var app = express();

// image upload & resize.
var formidable = require('formidable');
var fs = require('fs');
var sharp = require('sharp');
var util = require('util');
var base64 = require('base64');

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/:name', function (req, res, next) {

  var fileName = req.params.name;
  res.sendFile(__dirname + '/public/' + fileName + '.html');
});

app.post('/upload/image', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // parse a file upload
  var form = new formidable.IncomingForm();
  //console.log(form);

  form.parse(req, function (err, fields, files) {
    res.writeHead(200, {
      'content-type': 'text/plain'
    });

    // 存储图片到根目录下
    var imageSavedPath = './user_image/' + files.preface.name;
    fs.rename(files.preface.path, imageSavedPath, function () {
      var filename = '/user_image/' + files.preface.name.split('.')[0] + '_fix.jpg';
      sharp(imageSavedPath).resize(500).jpeg().rotate().toBuffer(function (err, buffer, info) {
        //console.log(base64.encode(buffer));
        var b64 = base64.encode(buffer); 
        var obj = util.inspect({
          filename: b64
        });
        res.end(obj);
      });

    });

  });

});

app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use('/js', express.static(__dirname + '/public/javascripts'));
app.use('/css', express.static(__dirname + '/public/stylesheets'));
app.use('/image', express.static(__dirname + '/public/images'));
app.use('/user_image', express.static(__dirname + '/user_image'));
app.use('/proxy', proxy('54.183.70.63', {
  forwardPath: function (req, res) {
    return require('url').parse(req.url).path;
  }
}));



app.listen(5000);
console.log('Listen Port:5000');
