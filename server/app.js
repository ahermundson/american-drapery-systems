// require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var decoder = require('./modules/decoder');
var surveys = require('./routes/surveys');
var measurements = require('./routes/measurements');
var clients = require('./routes/clients');
var users = require('./routes/users');
var areas = require('./routes/areas');
// var testdata = require('./routes/testdata');
var files = require('./routes/files');
var userChecker = require('./modules/user-checker');


// serve static files
app.use(express.static('public'));
app.use(bodyParser.json()); // needed for angular requests

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

var portDecision = process.env.PORT || 3000;

app.listen(portDecision, function() {
  console.log("listening on port", portDecision);
});

//everything below decoder requires authentication

app.use(decoder.token);
app.use(userChecker.user);

app.use('/clients', clients);
app.use('/users', users);
app.use('/surveys', surveys);
app.use('/files', files);
app.use('/measurements', measurements);
app.use('/areas', areas);
