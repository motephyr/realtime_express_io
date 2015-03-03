// Server side use socket.io & express
var environment = require('./environment.js');
//var redis = environment.loadRedis();
var io = environment.loadSocketIo();

var uuid = require('node-uuid');
environment.authorize(io, uuid);

var path = require('path');
var express = require('express');
var app = express();

// image upload & resize.
var formidable = require('formidable');
var fs = require('fs');
//var sharp = require('sharp');
var util = require('util');
//var base64 = require('base64');

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

var route = require('./route.js');

route.loadApp(app,express);


app.listen(5000);
console.log('Listen Port:5000');
