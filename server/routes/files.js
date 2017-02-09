var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var pg = require('pg');

var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var uuid = require('../modules/uuid-creator');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY
});

/**********************************************
                GLOBAL STORAGE
***********************************************/
var currentFileNumber,
    fileInfo,
    currentKey,
    areaId,
    surveyId,
    originalName,
    awsLocation;
var bucket = 'american-drapery-systems';
var keys = {}; //storing AWS.S3 file keys here
var fileNames = {};
var fileInfo = {};
var s3 = new aws.S3({signatureVersion: 'v4'});
var pool = new pg.Pool(config);
/**********************************************
                 AMAZON UPLOAD
***********************************************/
var upload = multer({
  //We iterate over everything below for each file in the FileList
  storage: multerS3({
    s3: s3,
    bucket: function(req, file, cb) {
      cb(null, bucket);
    },
    key: function(req, file, cb) {
      console.log("FILE IN KEY FXN: ", file.originalname);
      currentFileNumber = req.files.length;//files.length increments by one each iteration and corresponds with file number
      currentKey = uuid();//each file needs a uuid for a key
      keys["file_" + currentFileNumber] = currentKey; //saves each key to the keys object
      fileNames["file_" + currentFileNumber] = file.originalname;
      areaId = req.params.areaId;
      surveyId = req.headers.survey_id;
      awsLocation = 'survey_' + surveyId + '/' + 'area_' + areaId + '/' + currentKey + file.originalname;
      cb(null, awsLocation);
      console.log("Done with image upload to: ", awsLocation);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read'
  })
});

router.post('/:areaId', upload.array('file', 10), function(req, res, next) {//max of 10 files
  fileInfo = req.body;
  pool.connect()
    .then(function(client) {
      for (var key in keys) {
        client.query("INSERT INTO files (file_info, bucket, key, area_id, original_name) " +
        "VALUES ($1, $2, $3, $4, $5)", [fileInfo[key], bucket, keys[key], areaId, fileNames[key]])
      }
    })
    .then(function(result) {
      console.log("Files info INSERT query success: ");
      res.sendStatus(201);
      client.release();
    })
    .catch(function(err) {
      console.log("Client: ", client);
      console.log("Query error inserting files info: ", err);
      res.sendStatus(500);
      client.release();
    })
});//end route

router.get('/:areaId', function(req, res) {
  areaId = req.params.areaId;
  console.log("files get route hit, search db for areaId: ", areaId);
  pool.connect()
    .then(function(client) {
      console.log("\n\nareaId bieng pulled: ", areaId);
      client.query('SELECT * FROM files WHERE area_id = $1', [areaId])
        .then(function(result) {
          console.log("Success! Retrieved these results from the DB: ", result.rows);
          res.send(result.rows);
          client.release();
        })
        .catch(function(err) {
          console.log("Error querying DB: ", err);
          res.sendStatus(500);
          client.release();
        });
    });
});//end route

router.get('/survey/:surveyId', function(req, res) {
  surveyId = req.params.surveyId;
  console.log("files get route hit, search db for areaId: ", surveyId);
  pool.connect()
    .then(function(client) {
      client.query('SELECT * FROM survey ' +
      'JOIN areas on areas.survey_id = survey.id ' +
      'JOIN files on files.area_id = areas.id ' +
      'WHERE survey.id = $1', [surveyId])
        .then(function(result) {
          console.log("Success! Retrieved these results from the DB: ", result.rows);
          res.send(result.rows);
          client.release();
        })
        .catch(function(err) {
          console.log("Error querying DB: ", err);
          res.sendStatus(500);
          client.release();
        });
    });
});//end route


router.delete('/:surveyId/:areaId/:key/:name', function(req, res) {
  surveyId = req.params.surveyId;
  areaId = req.params.areaId;
  currentKey = req.params.key;
  originalName = req.params.name;
  console.log("Delete route hit");

  var params = {
    Bucket: 'american-drapery-systems',
    Key: 'survey_' + surveyId + '/area_' + areaId + '/' + currentKey + originalName,
  };

  s3.deleteObject(params, function(err, data) {
    if(err) console.log("Error deleting from AWS: ", err);
    else console.log("AWS delete data: ", data);
    pool.connect()
      .then(function(client) {
        client.query('DELETE FROM files WHERE key = $1', [currentKey])
          .then(function(result) {
            console.log("Delete from DB success: ", result);
            res.sendStatus(200);
            client.release();
          })
          .catch(function(err) {
            console.log("Error deleting from DB: ", err);
            res.sendStatus(500);
            client.release();
          });
      });
  });
});//end route


module.exports = router;
