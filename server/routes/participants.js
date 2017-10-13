var express = require('express');
var router = express.Router();

var VoiceResponse = require('twilio').twiml.VoiceResponse;
var config = require('../../twilio.config');

router.post('/', function(req, res) {
  const resp = new VoiceResponse();
  const type = {dir: 'call', skill: 'skill_1'};
  const json = JSON.stringify(type);

  resp.enqueueTask({
    workflowSid: config.workflowSid,
  }).task({priority: '1'}, json)

  res.send(resp.toString());

});

router.post('/events', function(req, res) {
  console.log('*********************************************************')
  console.log('*********************************************************')
  console.log('********************* CALL EVENT *****************************')
  console.log(`${req.body}`)

  res.send({})

});

router.post('/outbound/dial', function(req, res) {

  const client = require('twilio')(config.accountSid, config.authToken);
  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks
    .create({
      workflowSid: config.workflowSid,
      taskChannel: 'custom1',
      attributes: '{"direction":"outbound", "agent_name":"bcoyle"}',
    }).then((task) => {
      const resp = new VoiceResponse();
      const dial = resp.dial();
      dial.conference({
        beep: false,
        waitUrl: '',
        startConferenceOnEnter: true,
        endConferenceOnExit: true
      }, task.sid);
      console.log(resp.toString())
      res.send(resp.toString());
    })
});

router.post('/hold', function(req, res) {
  const client = require('twilio')(config.accountSid, config.authToken);

  // Get List of participants based on friendly name
  // client
  // .conferences('CFbbe4632a3c49700934481addd5ce1659')
  // .participants.each(participant => console.log(participant.muted));

  // Place participant on hold
  client.api.accounts(config.accountSid)
  .conferences(config.accountSid)
  .participants('CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
  .update({hold: 'true'})
  .then((participant) => console.log(participant.hold))
  .done();
});

router.post('/transfer', function(req, res) {
  const client = require('twilio')(config.accountSid, config.authToken);

  const resp = new VoiceResponse();
  const type = {direction: 'outbound', type: 'transfer'};
  const json = JSON.stringify(type);

  resp.enqueueTask({
    workflowSid: config.workflowSid,
  }).task({priority: '1'}, json)

  res.send(resp.toString());

  // client.taskrouter.v1
  //   .workspaces(config.workspaceSid)
  //   .tasks
  //   .create({
  //     workflowSid: config.workflowSid,
  //     taskChannel: 'voice',
  //     attributes: '{"direction":"outbound", type: "transfer", "client": agent_name }',
  //   }).then((task) => {
  //     const resp = new VoiceResponse();
  //     const dial = resp.dial();
  //     dial.conference({
  //       beep: false,
  //       waitUrl: '',
  //       startConferenceOnEnter: true,
  //       endConferenceOnExit: true
  //     }, task.sid);
  //     console.log(resp.toString())
  //     res.send(resp.toString());
  //   })
});

module.exports = router;
