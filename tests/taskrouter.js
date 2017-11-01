var twilio = require('twilio');
var mocha = require('mocha');
var test = require('tape');

var supertest = require('supertest');
const config = require('../twilio.config');
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

describe('Taskrouter Workflow Integration Tests', function() {

  // it('should return a list of workspaces', function() {
  //   client.taskrouter.v1.workspaces.list().then(workspaces => {
  //     workspaces.forEach(workspace => console.log(workspace.friendlyName));
  //   });
  // });

  test('should create a task and end up in a task queue', function(assert) {
    let actual_event_types = []
    const expected_event_types = ['task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const task_attributes = '{"skill":"customer_care"}'

    // updateWorkerActivity(voicemail_worker, offline)
    // updateWorkerActivity(customer_care_worker, offline)
    // updateWorkerActivity(customer_care_worker2, offline)

    console.log('--> Creating task with attributes ' + task_attributes + ' ...')
    console.log('--> Applying task to workflow ' + config.workflowSid + '...')

    client.taskrouter.v1
      .workspaces(config.workspaceSid)
      .tasks
      .create({
        workflowSid: config.workflowSid,
        attributes: task_attributes,
        timeout: 300,
      }).then((task) => {
        console.log('--> Retrieving events for task ' + task.sid + '...')
        console.log('')

        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            res.body.events.forEach((event) => actual_event_types.push(event.event_type));
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'should receive events ' + JSON.stringify(expected_event_types))
            assert.end()
            removeTask(task.sid)
          });
      });
  });

  test('should assign a task created from a transfer call to the right agent', function(assert) {
    let actual_event_types = []
    const expected_event_types = ['reservation.created', 'task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const task_attributes = '{"type":"transfer","agent_id":"tony"}'

    updateWorkerActivity(customer_care_worker2, idle)
    updateWorkerActivity(customer_care_worker, idle)
    updateWorkerActivity(voicemail_worker, idle)

    console.log('--> Creating task with attributes ' + task_attributes + ' ...')
    console.log('--> Applying task to workflow ' + config.workflowSid + '...')

    client.taskrouter.v1
      .workspaces(config.workspaceSid)
      .tasks
      .create({
        workflowSid: config.workflowSid,
        attributes: task_attributes,
        timeout: 300,
      }).then((task) => {
        console.log('')

        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            console.log('--> Retrieved events for task ' + task.sid + '...')

            res.body.events.forEach((event) => actual_event_types.push(event.event_type));
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'Reservation was created for a transfer task and assigned to the right agent')
            assert.end()
            removeTask(task.sid)
            updateWorkerActivity(customer_care_worker2, offline)
            updateWorkerActivity(customer_care_worker, offline)
            updateWorkerActivity(voicemail_worker, offline)
          });
      });
  });

  test('should not transfer a call to an agent on an outbound call', function(assert) {
    let actual_event_types = []
    const expected_event_types_for_outbound = ['reservation.created', 'task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const expected_event_types_for_transfer = ['task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const transfer_task_attributes = '{"type":"transfer","agent_id":"tony"}'
    const outbound_task_attributes = '{"direction":"outbound", "agent_name":"brian"}'

    updateWorkerActivity(customer_care_worker2, idle)
    updateWorkerActivity(voicemail_worker, idle)

    console.log('--> Creating task with attributes ' + outbound_task_attributes + '...')
    console.log('--> Applying task to workflow ' + config.workflowSid + '...')

    client.taskrouter.v1
      .workspaces(config.workspaceSid)
      .tasks
      .create({
        workflowSid: config.workflowSid,
        taskChannel: 'custom1',
        attributes: outbound_task_attributes,
        timeout: 300,
      }).then((task) => {
        console.log('--> Retrieving events for task ' + task.sid + '...')
        console.log('')

        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            res.body.events.forEach((event) => actual_event_types.push(event.event_type));
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types_for_outbound.sort()),
                         'outbound call should be assigned to an agent')
            // removeTask(task.sid)
            // Notes: Complete the task here and assert event reservation created for the next task
          });
      });

    console.log('--> Creating task with attributes ' + transfer_task_attributes + '...')
    console.log('--> Applying task to workflow ' + config.workflowSid + '...')

    client.taskrouter.v1
      .workspaces(config.workspaceSid)
      .tasks
      .create({
        workflowSid: config.workflowSid,
        attributes: transfer_task_attributes,
        timeout: 300,
      }).then((task) => {
        console.log('--> Retrieving events for task ' + task.sid + '...')
        console.log('')

        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            res.body.events.forEach((event) => actual_event_types.push(event.event_type));
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types_for_transfer.sort()),
                         'should receive events ' + expected_event_types_for_transfer.sort())
            assert.end()
            removeTask(task.sid)
            updateWorkerActivity(customer_care_worker2, offline)
            updateWorkerActivity(voicemail_worker, offline)
          });
      });
  });

  test('outbound call should have the highest priority and be assigned to the right agent', function(assert) {
    let actual_event_types = []
    let task_priority = null
    let reservation_description = ""
    const expected_event_types = ['reservation.created', 'task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const task_attributes = '{"direction":"outbound", "agent_name":"tony"}'

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

        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            console.log('--> Retrieved events for task ' + task.sid + '...')

            res.body.events.forEach((event) => {
              actual_event_types.push(event.event_type)
              if(event.event_data.task_priority) {
                task_priority = event.event_data.task_priority
              }

              if (event.event_type == 'reservation.created') {
                // event.description should contain the following string
                // Task <TaskSID> assigned to Worker <WorkerFriendlyName>tr with Reservation <ReservationSID>
                reservation_description = event.description
              }
            });
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'reservation should be created and outbound call should be assigned to an agent')
            assert.equal(task_priority, '1000', 'tasks for outbound calls should have a high priority over all other tasks')
            assert.ok(reservation_description.includes('Task ' + task.sid + ' assigned to Worker Tony'), 'Reservation was created and assigned to the right agent')
            assert.end()
            removeTask(task.sid)
            updateWorkerActivity(voicemail_worker, offline)
            updateWorkerActivity(customer_care_worker, offline)
          });
      });
  });

  test('inbound customer care call should be assigned to an available customer care agent and not a voicemail worker', function(assert) {
    let actual_event_types = []
    let task_priority = null
    let reservation_description = ""
    const expected_event_types = ['reservation.created', 'task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const task_attributes = '{"direction":"inbound", "skill":"customer_care"}'

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
        attributes: task_attributes,
        timeout: 300,
      }).then((task) => {
        console.log('')

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
                // event.description should contain the following string
                // Task <TaskSID> assigned to Worker <WorkerFriendlyName>tr with Reservation <ReservationSID>
                reservation_description = event.description
              }
            });
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'reservation should be created and inbound customer care call should be assigned to a customer care agent')
            assert.ok(reservation_description.includes('Task ' + task.sid + ' assigned to Worker Tony'), 'Reservation was created and assigned to the right agent')
            assert.end()
            removeTask(task.sid)
            updateWorkerActivity(voicemail_worker, offline)
            updateWorkerActivity(customer_care_worker, offline)
          });
      });
  });

  test('inbound sales call should be assigned to an available agent and not a voicemail worker', function(assert) {
    let actual_event_types = []
    let task_priority = null
    let reservation_description = ""
    const expected_event_types = ['reservation.created', 'task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched']
    const task_attributes = '{"direction":"inbound", "skill":"sales"}'

    // Note: Do prechecks. Make sure workers are available in specified order
    updateWorkerActivity(voicemail_worker, idle)
    updateWorkerActivity(sales_worker, idle)

    console.log('--> Creating task with attributes ' + task_attributes + '...')
    console.log('--> Applying task to workflow ' + config.workflowSid + '...')

    client.taskrouter.v1
      .workspaces(config.workspaceSid)
      .tasks
      .create({
        workflowSid: config.workflowSid,
        attributes: task_attributes,
        timeout: 300,
      }).then((task) => {
        console.log('')

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
                // event.description should contain the following string
                // Task <TaskSID> assigned to Worker <WorkerFriendlyName>tr with Reservation <ReservationSID>
                reservation_description = event.description
              }
            });
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'reservation should be created and inbound sales call should be assigned to a sales agent')
            assert.ok(reservation_description.includes('Task ' + task.sid + ' assigned to Worker Joe (Sales)'), 'Reservation was created and assigned to the right agent')
            assert.end()
            removeTask(task.sid)
            updateWorkerActivity(voicemail_worker, offline)
            updateWorkerActivity(customer_care_worker, offline)
          });
      });
  });

  test('should assign task to voicemail worker if all agents are offline', function(assert) {
    let actual_event_types = []
    let reservation_description = ""
    const expected_event_types = ['task-queue.entered', 'task.created', 'workflow.entered', 'workflow.target-matched', 'reservation.created']
    const task_attributes = '{"skill":"customer_care"}'

    updateWorkerActivity(customer_care_worker2, offline)
    updateWorkerActivity(customer_care_worker, offline)
    updateWorkerActivity(voicemail_worker, idle)

    console.log('--> Creating task with attributes {"skill":"customer_care"}...')
    console.log('--> Applying task to workflow ' + config.workflowSid + '...')
    client.taskrouter.v1
      .workspaces(config.workspaceSid)
      .tasks
      .create({
        workflowSid: config.workflowSid,
        attributes: task_attributes,
        timeout: 300,
      }).then((task) => {

        console.log('--> Retrieving events for task ' + task.sid + '...')
        console.log('')

        taskrouter_events_api
          .get('/')
          .auth(config.accountSid, config.authToken)
          .query('TaskSid=' + task.sid)
          .expect(200)
          .end(function(err, res) {
            res.body.events.forEach((event) => {
              actual_event_types.push(event.event_type)
              if (event.event_type == 'reservation.created') {
                // event.description should contain the following string
                // Task <TaskSID> assigned to Worker <WorkerFriendlyName>tr with Reservation <ReservationSID>
                reservation_description = event.description
              }
            })
            assert.error(err, 'No errors using TaskRouter events API');
            assert.equal(JSON.stringify(actual_event_types.sort()),
                         JSON.stringify(expected_event_types.sort()),
                         'should receive events ' + expected_event_types)
            assert.ok(reservation_description.includes('Task ' + task.sid + ' assigned to Worker Voicemail'), 'Reservation was created and assigned to the right agent')
            assert.end()
            removeTask(task.sid)
          });
      });
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
        setTimeout(function () {}, 1000);
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

// function findReservationByTaskSid(taskSid) {
//   client.taskrouter.v1
//     .workspaces(config.workspaceSid)
//     .tasks(taskSid)
//     .reservations.list()
//     .then(data => {
//       data.reservations.forEach(reservation => {
//         console.log(reservation.reservationStatus);
//         console.log(reservation.workerName);
//       });
//     });
// }

// function listAllEvents(taskSid) {
//   console.log('LISTING ALL EVENTS => ', taskSid)
//   setTimeout(function () {{};}, 10000);
//
//   client.taskrouter.v1
//     .workspaces(config.workspaceSid)
//     .events
//     .list({
//       taskSid: taskSid
//     })
//     .then((data) => {
//       data.events.forEach((event) => console.log('EVENT TYPE =>', event.event_type));
//     });
// }
