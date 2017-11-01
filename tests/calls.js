var twilio = require('twilio');
var chai = require('chai');
var expect = chai.expect;
var app = require('../server');
var supertest = require('supertest');
const config = require('../twilio.config');
const client = require('twilio')(config.accountSid, config.authToken);


describe('Calls API Integration Tests', function() {
  describe('#GET /transfer on /api/calls', function() {
    it('should render JSON to create a task', function(done) {
      supertest(app).post('/api/calls/transfer')
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200);
          expect(res.body.priority).to.equal(1000);
          expect(res.body.workflowFriendlyName).to.equal('Sales Requests');
          expect(res.body.taskChannelUniqueName).to.equal('voice');
        });
    });
  });

});
