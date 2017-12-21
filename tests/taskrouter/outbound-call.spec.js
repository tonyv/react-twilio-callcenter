var twilio = require('twilio');
var test = require('colored-tape');

var supertest = require('supertest');
const config = require('../../twilio.config');
const client = require('twilio')(config.accountSid, config.authToken);

// Activities
const idle = 'WA161140052b08b45f4c7fbcc03e3aadda';
const offline = 'WA212591dc0f1b862d32a9fff8db8e2b31';
const busy = 'WAf1f8b8b7dcf6c63e57e023ab157e994e';
const reserved = 'WAc4daebea1499ab38e4af81bf8b7290f3';
const wrapup = 'WA7b3dd894fdcc11ca89cee621a8b0979d';

// Workers
const customer_care_worker2 = 'WK8ed48354287f6809c162ea1a63712e7d';
const customer_care_worker = 'WKa11a52ccad4388a1b34a4952239c3214';
const sales_worker = 'WKa5676832c7063f0122afaafd2eb1153c';
const voicemail_worker = 'WKb0e9f069debe5065b3314561a452d5be';

var taskrouter_events_api = supertest('https://taskrouter.twilio.com/v1/Workspaces/' + config.workspaceSid + '/Events')

// GET /v1/Workspaces/{WorkspaceSid}/Tasks/{TaskSid}/Reservations
var taskrouter_reservations_api = supertest('https://taskrouter.twilio.com/v1/Workspaces/' + config.workspaceSid + '/Tasks')
var worker_api = supertest('https://taskrouter.twilio.com/v1/Workspaces/' + config.workspaceSid + '/Workers')

test('outbound call should have the highest priority and be assigned to the right agent', function(assert) {
  let actual_event_types = []
  let task_priority = null
  const expected_event_types = ['reservation.created', 'task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
  const task_attributes = '{"direction":"outbound", "agent":"tvu"}'

  // Note: Do prechecks. Make sure workers are available in specified order
  updateWorkerActivity(voicemail_worker, idle)
  updateWorkerActivity(customer_care_worker, idle)

  console.log('--> Creating task with attributes ' + task_attributes + '...')
  console.log('--> Applying task to workflow ' + config.workflowSid + '...')

  client.taskrouter.v1
    .workspaces(config.workspaceSid)
    .tasks
    .create({
      workflowSid: config.workflowSid,
      taskChannel: 'custom1',
      attributes: task_attributes,
      timeout: 300,
    }).then((task) => {
      console.log('')

      setTimeout(function () {
        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            console.log('--> Retrieved events for task ' + task.sid + '...')

            res.body.events.forEach((event) => {
              actual_event_types.push(event.event_type)

              if (event.event_type == 'reservation.created') {
                worker_assigned = event.event_data.worker_sid
              }
            });

            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'reservation should be created and outbound call should be assigned to an agent')
            assert.equal(task.priority, 1000, 'tasks for outbound calls should have a high priority over all other tasks')
            assert.equal(worker_assigned, customer_care_worker, 'Reservation was assigned to the right agent')

            removeTask(task.sid)
            updateWorkerActivity(voicemail_worker, offline)
            updateWorkerActivity(customer_care_worker, offline)
            assert.end()
          });
      }, 2000);
    });
});

function createWorker(type, name) {
  client.taskrouter.v1.workspaces(config.workspaceSid).workers.create({
    friendlyName: type.charAt(0).toUpperCase() + type.slice(1) + ' Worker 1',
    attributes: '{"agent_name:"' + name + '"skill":' + "\"" + type + "\"" + '}',
  }).then((worker) => {
    console.log('Worker SID =>', worker.sid)
  });
}

function updateWorkerActivity(workerSid, activity) {
  worker_api
    .post('/' + workerSid)
    .auth(config.accountSid, config.authToken)
    .send({'ActivitySid': activity})
    .set('Accept', 'application/json')
    .type('form')
    .expect(200)
    .end(function (err, res) {
      if (err) {
        throw err
      } else if (res.body) {
        console.log('--> Updated Worker Status: ' + res.body.friendly_name + ' (' + res.body.activity_name + ')')
      }
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

function findEventByTaskSid(taskSid) {
  taskrouter_events_api
    .get('/')
    .auth(config.accountSid, config.authToken)
    .query('TaskSid=' + taskSid)
    .expect(200)
    .end(function(err, res) {
      console.log('res.body =>', res.body)
    });
}
