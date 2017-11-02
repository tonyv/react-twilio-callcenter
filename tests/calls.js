var twilio = require('twilio')
var chai = require('chai')
var expect = chai.expect
var app = require('../server')
var supertest = require('supertest')
const config = require('../twilio.config')
const client = require('twilio')(config.accountSid, config.authToken)


describe('Calls API Endpoint Tests', function() {
  describe('#GET /transfer on /api/calls', function() {
    const workflowFriendlyName = 'Sales Requests'

    it('should render JSON to create a task', function(done) {
      supertest(app).post('/api/calls/transfer')
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200)
          expect(res.body.priority).to.equal(1000)
          expect(res.body.workflowFriendlyName).to.equal(workflowFriendlyName)
          expect(res.body.taskChannelUniqueName).to.equal('voice')
          done()
        })
    })
  })

  describe('#POST /outbound on /api/taskrouter', function() {
    const workflowFriendlyName = 'Sales Requests'

    it('should render JSON to create an outbound task', function(done) {
      supertest(app).post('/api/taskrouter/outbound')
        .send({'To': '4158871268',
               'From': 'client:tvu',
               'Agent': 'tony' })
        .set('Accept', 'application/json')
        .type('form')
        .end(function(err, res) {
          console.log('res =>', res.body)
          expect(res.statusCode).to.equal(200)
          expect(res.body.priority).to.equal(1000)
          expect(res.body.workflowFriendlyName).to.equal(workflowFriendlyName)
          expect(res.body.taskChannelUniqueName).to.equal('custom1')
          expect(res.body.attributes).to.equal('{"agent_name":"bcoyle","from":"client:tvu","to":"4158871268","direction":"outbound"}')
          done()
        })
    })
  })

  // describe('#POST /assignment on /api/taskrouter', function() {
  //   body = { WorkerAttributes: '', TaskAttributes: '' }
  //
  //   it('should return JSON instruction to send task to voicemail worker', function(done) {
  //     supertest(app).post('/api/taskrouter/assignment')
  //       .send(JSON.stringify(body))
  //       .set('Accept', 'application/json')
  //       .type('form')
  //       .end(function(err, res) {
  //         console.log('res =>', res.body)
  //         done()
  //       })
  //   })
  // })

  describe('#POST /conference/:conference_sid/participant on /api/calls', function() {
    const workflowFriendlyName = 'Sales Requests'
    const conference_sid = 'WT984f64594ab0d0a67a05df3b2c6cd440'
    const agent = 'tony'

    it('should render TwiML to add a transferee to the conference', function(done) {
      const expected_twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Conference beep="true" startConferenceOnEnter="true" endConferenceOnExit="false">WT984f64594ab0d0a67a05df3b2c6cd440</Conference></Dial></Response>'
      supertest(app).post('/api/calls/conference/' + conference_sid + '/participant')
        .set('Accept', 'application/json')
        .type('form')
        .end(function(err, res) {
          console.log('res =>', res.text)
          expect(res.text).to.equal(expected_twiml)
          done()
        })
    })
  })

  describe('#POST /outbound/dial/:to/conf/:conference_id on /api/calls', function() {
    const workflowFriendlyName = 'Sales Requests'
    const conference_id= 'WT984f64594ab0d0a67a05df3b2c6cd440'
    const to = '4158871268'

    it('should render TwiML to add bring caller and callee into the conference for external transfers', function(done) {
      const expected_twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Conference beep="false" waitUrl="" startConferenceOnEnter="true" endConferenceOnExit="false">WT984f64594ab0d0a67a05df3b2c6cd440</Conference></Dial></Response>'
      supertest(app).post('/api/calls/outbound/dial/' + to + '/conf/' + conference_id)
        .set('Accept', 'application/json')
        .type('form')
        .end(function(err, res) {
          expect(res.text).to.equal(expected_twiml)
          done()
        })
    })
  })

  describe('#POST / on /api/calls', function() {
    const workflowFriendlyName = 'Sales Requests'
    const workflowSid= 'WW761faf5f75acc9ee99d62476a84e6260'

    it('should render TwiML to enqueue a task', function(done) {
      const expected_twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Enqueue workflowSid="WW761faf5f75acc9ee99d62476a84e6260"><Task priority="1">{"skill":"customer_care","type":"inbound"}</Task></Enqueue></Response>'
      supertest(app).post('/api/calls')
        .set('Accept', 'application/json')
        .type('form')
        .end(function(err, res) {
          expect(res.text).to.equal(expected_twiml)
          done()
        })
    })
  })
})
