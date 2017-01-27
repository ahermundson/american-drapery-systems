var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var pg = require('pg');

var pool = new pg.Pool(config);
router.get('/:area_id', function(req, res) {
  console.log('area id',req.params.area_id);
  var area_id = req.params.area_id;
  pool.connect()
    .then(function(client) {
      client.query('SELECT * FROM areas ' +
      'JOIN survey on areas.survey_id = survey.id ' +
      'JOIN client on survey.client_id = client.id ' +
      'WHERE areas.id = $1', [area_id])
        .then(function(result) {
          client.release();
          console.log('area - survey get success');
          // console.log(result.rows);
          res.send(result.rows);
        })
        .catch(function(err) {
          client.release();
          console.log('select query error: ', err);
          res.sendStatus(500);
        });
    });
});
router.post('/', function(req,res) {
  var newArea = req.body;
  if (req.authorized === false) {
    res.sendStatus(403);
  } else {
    pool.connect()
      .then(function(client) {
        client.query("INSERT INTO areas (area_name, survey_id, notes) " +
        "VALUES ($1,$2,$3) " +
        "RETURNING id",
        [newArea.area_name, newArea.survey_id, newArea.notes])
        .then(function(result) {
          client.release();
          console.log("area info put complete");
          //Get the id of the most recently added area
          res.send(result.rows);
        })
        .catch(function(err) {
          client.release();
          console.log('select query error: ', err);
          res.sendStatus(500);
        });
      });
  }
});

router.delete('/', function(req, res) {
  if (req.authorized === false) {
    res.sendStatus(403);
  } else {
    var ids = req.query.id;
    var string = "(";
    //parse array into SQL string
    for (var i = 0; i < ids.length; i++) {
      string+= parseInt(ids[i]) + ',';
    }
    string = string.substring(0, string.length-1);
    string+=')';
    console.log('delstring, ids', string, ids);
    pool.connect()
      .then(function(client) {
        client.query("DELETE from areas " +
        "WHERE id in " + string)
        .then(function(result) {
          client.release();
          console.log("delete complete");
          res.sendStatus(204);
        })
        .catch(function(err) {
          client.release();
          console.log('delete error: ', err);
          res.sendStatus(500);
        } );
      });
  }
});

//update area
router.put('/notes/:area_id', function(req, res) {
  if (req.authorized === false) {
    res.sendStatus(403);
  } else {
    var area = req.body;
    var id = req.params.area_id;
    console.log("Reached edit new area route: ", area);
    pool.connect()
      .then(function(client) {
        client.query('UPDATE areas ' +
        'SET notes = $1 ' +
        'WHERE areas.id = $2',
        [area.note, id])
        .then(function(result) {
          client.release();
          console.log("PUT complete");
          res.sendStatus(201);
        })
        .catch(function(err) {
          client.release();
          console.log("PUT unsuccesful: Notes not updated ", err);
          res.sendStatus(500);
        });
      });
  }
});


module.exports = router;
