var express = require('express');
var router = express.Router();

var VoiceResponse = require('twilio').twiml.VoiceResponse;
var config = require('../../twilio.config');

router.post('/', function(req, res) {
  const resp = new VoiceResponse();
  const type = {skill: 'customer_care', type: 'inbound' };
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

router.post('/conference/:conference_sid/hold/:call_sid/:toggle', function(req, res) {
  const client = require('twilio')(config.accountSid, config.authToken);
  const confSid = req.params.conference_sid
  const callSid = req.params.call_sid
  const toggle = req.params.toggle
  client.api.accounts(config.accountSid)
    .conferences(confSid)
    .participants(callSid)
    .update({hold: toggle})
    .then((participant) => console.log(participant.hold))
    .done();
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

router.get('/conference/:conference_sid/participant', function(req, res) {
  const client = require('twilio')(config.accountSid, config.authToken);

  const resp = new VoiceResponse();
  const dial = resp.dial();

  dial.conference({
    beep: true,
    startConferenceOnEnter: true,
    endConferenceOnExit: false
  }, req.params.conference_sid);

  res.send(resp.toString());
  // res.send({});
});

router.post('/transfers/external', function(req, res) {
  const client = require('twilio')(config.accountSid, config.authToken);

  client
    .conferences(req.body.confName)
    .participants.create({
      to: req.body.phoneNumber,
      from: '+15304412022',
    }).then(participant => console.log(participant.sid));
});

router.post('/transfer', function(req, res) {
  const client = require('twilio')(config.accountSid, config.authToken);

  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks
    .create({
      workflowSid: config.workflowSid,
      taskChannel: 'voice',
      attributes: JSON.stringify({direction:"outbound",
                                  type:"transfer",
                                  agent_id:"tony",
                                  confName: req.body.confName}),
    }).then((task) => {
      console.log(task);
      res.send({});
    });

  // res.send(resp.toString());

  // const resp = new VoiceResponse();
  // const type = {direction: 'outbound', type: 'transfer', client: 'tvu'};
  // const json = JSON.stringify(type);
  //
  // resp.enqueueTask({
  //   workflowSid: config.workflowSid,
  // }).task({priority: '1'}, json)
  //
  // res.send(resp.toString());

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
