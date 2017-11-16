var twilio = require('twilio');

const config = require('../twilio.config');
const client = require('twilio')(config.accountSid, config.authToken);

removeAllTasks()

function removeAllTasks() {
  console.log('--> Removing ALL tasks...')
  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks
    .list()
    .then((tasks) => {
      tasks.forEach((task) => {
        console.log("--> Removing task " + task.sid + " ...")
        removeTask(task.sid)
      });
    });
}

function removeTask(taskSid) {
  console.log('--> Removing task...', taskSid)
  console.log('')
  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks(taskSid)
    .remove()
}
