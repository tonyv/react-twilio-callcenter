var twilio = require('twilio');
var test = require('colored-tape');

var supertest = require('supertest');
const config = require('../../twilio.config');
const client = require('twilio')(config.accountSid, config.authToken);

test('remove all tasks', function(assert) {
  console.log('--> Removing ALL tasks...')

  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks
    .list()
    .then((tasks) => {
      tasks.forEach((task) => {
        console.log("--> Removing task " + task.sid + " ...")
        client.taskrouter.v1
          .workspaces(config.workspaceSid)
          .tasks(task.sid)
          .remove()
      });
      assert.equal(tasks.length, 0, "All tasks removed")
      assert.end()
    });
});
