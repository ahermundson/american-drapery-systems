var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var pg = require('pg');

var pool = new pg.Pool(config);

//Get request to populate Company Dropdown
router.get('/', function(req, res) {
  console.log('reached get clients route')
  pool.connect()
    .then(function(client) {
      client.query('SELECT * FROM client ORDER BY client_name')
        .then(function(result) {
          client.release();
          console.log('number of clients sent:', result.rows.length);
          res.send(result.rows);
        })
        .catch(function(err) {
          console.log('select query error: ', err);
          client.release();
          res.sendStatus(500);
        });
    });
});

//Get request to populate client profile fields
router.get('/:clientId', function(req, res) {
  console.log('reached get clients route', req.params.clientId)
  pool.connect()
  .then(function(client) {
    client.query('SELECT * FROM client WHERE id = ' + req.params.clientId)
     .then(function(result) {
       client.release();
       console.log('number of clients sent:', result.rows.length);
       res.send(result.rows);
    })
    .catch(function(err) {
      console.log('select query error: ', err);
      client.release();
      res.sendStatus(500);
    });
  });
});

//Post request to add client information
router.post('/', function(req,res) {
  if (req.authorized === false) {
    res.sendStatus(403);
  } else {
    console.log(req.body);
    var newClient = req.body;
    var date = new Date();
    pool.connect()
      .then(function(client) {
        client.query("INSERT INTO client (client_name, primary_contact_name, primary_contact_phone_number, primary_contact_email, alt_contact_name, alt_contact_email, alt_phone_number, billing_address_street, billing_address_city, billing_address_state, billing_address_zip) " +
        "VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) " +
        "RETURNING id",
        [newClient.client_name, newClient.primary_contact_name, newClient.primary_contact_phone_number, newClient.primary_contact_email, newClient.alt_contact_name, newClient.alt_contact_email, newClient.alt_phone_number, newClient.billing_address_street, newClient.billing_address_city, newClient.billing_address_street, newClient.billing_address_zip])
        .then(function(result) {
          client.release();
          console.log("client info put complete");
          //Get the id of the most recently added client
          res.send(result.rows);
        })
        .catch(function(err) {
          console.log('select query error: ', err);
          client.release();
          res.sendStatus(500);
        });
      });
  }
});


//EDIT already exisiting client
router.post('/:client_id', function(req,res) {
  if (req.authorized === false) {
    res.sendStatus(403);
  } else {
    console.log(req.body);
    var id = req.params.client_id;
    var updatedClient = req.body;
    var date = new Date();
    pool.connect()
      .then(function(client) {
      client.query("UPDATE client " +
      "SET client_name = $1, primary_contact_name = $2, primary_contact_phone_number = $3, primary_contact_email = $4, alt_contact_name = $5, alt_contact_email = $6, alt_phone_number = $7, billing_address_street = $8, billing_address_city = $9, billing_address_state = $10, billing_address_zip = $11 " +
      "WHERE id = " + id,
      [updatedClient.client_name, updatedClient.primary_contact_name, updatedClient.primary_contact_phone_number, updatedClient.primary_contact_email, updatedClient.alt_contact_name, updatedClient.alt_contact_email, updatedClient.alt_phone_number, updatedClient.billing_address_street, updatedClient.billing_address_city, updatedClient.billing_address_state, updatedClient.billing_address_zip])
        .then(function(result) {
          client.release();
          res.sendStatus(201);
        })
        .catch(function(err) {
          console.log('select query error: ', err);
          client.release();
          res.sendStatus(500);
        });
      });
  }
});

module.exports = router;
