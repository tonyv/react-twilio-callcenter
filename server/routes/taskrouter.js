var express = require('express');
var router = express.Router();

var twilio = require('twilio');
var config = require('../../twilio.config');

router.post('/assignment', function(req, res) {
  var instructions = {};
  res.send(instructions)
});

router.post('/event', function(req, res) {
  console.log('*********************************************************')
  console.log('*********************************************************')
  console.log('*********************************************************')
  console.log(`${req.body.EventType} --- ${req.body.EventDescription}`)

  res.send({})
})



module.exports = router;
