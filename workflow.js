var twilio = require('twilio');

var accountSid = "";
var authToken = "";
var workspaceSid = "";
var workflowSid = "";
var client = new twilio.TaskRouterClient(accountSid, authToken, workspaceSid);

let json =
{
  "task_routing":{
     "filters":[
        {
           "targets":[
             {
               "queue": "WQb9036a0a8842586969ced85237c2dbed",
               "expression": "task.skill == worker.skill AND worker.channel.custom1.assigned_tasks == 0",
               "timeout": "30",
               "priority": "2"
             },
             {
               "queue":"WQcf6a3ca29a48c7dfe6dca173a6f3e5a5",
               "expression":"1==1",
             }
           ],
           "filter_friendly_name":"",
           "expression":"type == 'inbound'"
        },
        {
           "targets":[
              {
                 "queue":"WQb9036a0a8842586969ced85237c2dbed",
                 "skip_if":"1 == 1",
                 "expression":"task.agent_id == worker.agent_id AND worker.channel.custom1.assigned_tasks == 0",
              },
              {
                 "queue":"WQcf6a3ca29a48c7dfe6dca173a6f3e5a5",
                 "expression":"1 == 1"
              }
           ],
           "filter_friendly_name":"",
           "expression":"type == 'transfer'"
        }
     ],
     "default_filter":{
        "queue":"WQb9036a0a8842586969ced85237c2dbed"
     }
   }
 }

client.workspace.workflows(workflowSid).update({
    configuration: JSON.stringify(json)
}, function(err, workflow) {
  console.log(err);
  console.log(workflow.configuration)
});
