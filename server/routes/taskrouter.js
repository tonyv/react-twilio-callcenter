var express = require('express');
var router = express.Router();

var twilio = require('twilio');
var config = require('../../twilio.config');

router.post('/assignment', function(req, res) {

  var taskAttributes = JSON.parse(req.body.TaskAttributes);
  var workerAttributes = JSON.parse(req.body.WorkerAttributes);
  var instructions = {}


  //console.log("Assignment called. Ignore this for now.  Accept client side");
  console.log(req.body);

  // if (taskAttributes.type == "transfer") {
  //   instructions = {
  //     "instruction": "call",
  //     "accept": "true",
  //     "from": "5304412022",
  //     "url": "http://.ngrok.io/api/calls/outbound/dial"
  //     }    /*
  //   console.log("Use REST API to create a new call and add to conf")
  //   const client = require('twilio')(config.accountSid, config.authToken);
  //   client
  //     .conferences(req.body.TaskSid)
  //     .participants.create({to: "client:bcoyle", from: "2146438999", earlyMedia: "true", statusCallback: "http://thinkvoice.ngrok.io/api/taskrouter/event"})
  //     .then((participant) => {
  //       //console.log(participant)
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //     })
  //   instructions = {"instruction": "accept"}
  //
  //   instructions = {
  //     "instruction": "call",
  //     "accept": "true",
  //     "from": "2146438999",
  //     "to": "client:bcoyle",
  //     "url": "http://thinkvoice.ngrok.io/api/calls/outbound/dial",
  //     "status_callback_url": "http://thinkvoice.ngrok.io/api/taskrouter/event"
  //     }
  //     */
  //
  // }

  //
  // if (taskAttributes.direction == "outbound") {
  //   console.log("Use REST API to create a new call and add to conf")
  //   const client = require('twilio')(config.accountSid, config.authToken);
  //   client
  //     .conferences(req.body.TaskSid)
  //     .participants.create({to: "7034749718", from: "2146438999", early_media: "true", status_callback: "http://thinkvoice.ngrok.io/api/taskrouter/event"})
  //     .then((participant) => {
  //       //console.log(participant)
  //     })
  //   instructions = {"instruction": "accept"}
  // }

  // If the worker doesn't have a client as contact uri then you will have to accept the task here.
  // if (!workerAttributes.contact_uri.match(/client:/)) {
  //   instructions = {"instruction": "conference"}
  // }
  if (workerAttributes["skills"]) {
    if (workerAttributes["skills"][0] == 'voicemail') {
      instructions = {"instruction": "redirect",
                      "call_sid": taskAttributes.call_sid,
                      "url": 'https://handler.twilio.com/twiml/EHdc2173198e8793cecd40420c94e562d4'}
    }
  }


  // if(taskAttributes.type) {
  //   if (taskAttributes.type == 'transfer') {
  //     // Add url argument
  //     instructions = {"from": "brian", "instruction": "call", "to": "client:tvu", url: "http://example.com/agent_answer" }
  //     // Add url to this
  //     //
  //   }
  // }

  res.send(instructions)

  /*
  // If you were to accept server side return this JSON
  // it's recommended to do client side
  console.log(taskAttributes)
  if (taskAttributes.direction == "outbound") {
    console.log("respond with call")
    res.send({
      "instruction": "call",
      "callTo": "client:bcoyle",
      "callFrom": "2146438999",
      "callAccept": "true",
      "callUrl": "http://thinkvoice.ngrok.io/api/calls/outbund/agent",
      "timeout": "3",
      "status_callback_url": "http://thinkvoice.ngrok.io/api/taskrouter/event"
    });
  }
 */
});

router.post('/event', function(req, res) {
  console.log('*********************************************************')
  console.log('*********************************************************')
  console.log('*********************************************************')
  console.log(`${req.body.EventType} --- ${req.body.EventDescription}`)

  res.send({})
})

router.post('/outbound', function(req, res) {
  //const resp = new VoiceResponse();
  // this is an outbuond call.  Assumes the Workflow has the following target
  /*
  {
    "targets": [
      {
        "queue": "queue sid",
        "expression": "task.agent_name==worker.agent_name",
        "priority": "1000"
      }
    ],
    "filter_friendly_name": "outbound",
    "expression": "direction == 'outbound'"
  }
  */
  console.log(req.body)
  const from = req.body.From
  const to = req.body.To
  const agent = req.body.Agent
  const client = require('twilio')(config.accountSid, config.authToken);
  // Create a Task on a custom channel
  // with the Task sid that was returned place this agent leg of the call into
  // a conference named by the task sid

  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks
    .create({
      workflowSid: config.workflowSid,
      taskChannel: 'custom1',
      attributes: JSON.stringify({direction:"outbound", agent_name: 'bcoyle', from: from, to: to}),
    }).then((task) => {
      console.log(task)
    })
    res.send({});
});



module.exports = router;
