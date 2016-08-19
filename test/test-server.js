var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server.js')

var should = chai.should()
var app = server.app
var storage = server.storage

chai.use(chaiHttp)

describe('Shopping List', function() {
    it('should list items on GET', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null)
                res.should.have.status(200)
                res.should.be.json
                res.body.should.be.a('array')
                res.body.should.have.length(3)
                res.body[0].should.be.a('object')
                res.body[0].should.have.property('id')
                res.body[0].should.have.property('name')
                res.body[0].id.should.be.a('number')
                res.body[0].name.should.be.a('string')
                res.body[0].name.should.equal('Broad beans')
                res.body[1].name.should.equal('Tomatoes')
                res.body[2].name.should.equal('Peppers')
                done()
            })
    })
    it('should add an item on POST', function(done) {
        chai.request(app)
            .post('/items')
            .send({
                'name': 'Kale'
            })
            .end(function(err, res) {
                should.equal(err, null)
                res.should.have.status(201)
                res.should.be.json
                res.body.should.be.a('object')
                res.body.should.have.property('name')
                res.body.should.have.property('id')
                res.body.name.should.be.a('string')
                res.body.id.should.be.a('number')
                res.body.name.should.equal('Kale')
                storage.items.should.be.a('array')
                storage.items.should.have.length(4)
                storage.items[3].should.be.a('object')
                storage.items[3].should.have.property('id')
                storage.items[3].should.have.property('name')
                storage.items[3].id.should.be.a('number')
                storage.items[3].name.should.be.a('string')
                storage.items[3].name.should.equal('Kale')
                done()
            })
    })
    it('should edit an item on put', function(done) {
        chai.request(app)
            .put('/items/3')
            .send({
                'name': 'New 3 Kale'
            })
            .end(function(err, res) {
                should.equal(err, null)
                res.should.be.json
                res.should.have.status(200)
                res.body.should.have.property('replaced')
                res.body.replaced.should.be.a('array')
                res.body.should.have.property('status')
                res.body.status.should.contain("Successfully replaced")
                done()
            })
    })
    it('should THEN reflect the newly-altered item', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null)
                res.should.have.status(200)
                res.should.be.json
                res.body.should.be.a('array')
                res.body.should.have.length(4)
                res.body[3].should.be.a('object')
                res.body[3].should.have.property('id')
                res.body[3].should.have.property('name')
                res.body[3].id.should.be.a('number')
                res.body[3].name.should.be.a('string')
                res.body[3].name.should.equal('New 3 Kale')
                done()
            })
    })
    it('should delete an item on delete', function(done) {
        chai.request(app)
            .delete('/items/3')
            .end(function(err, res) {
                should.equal(err, null)
                res.should.be.json
                res.should.have.status(200)
                res.body.items.should.have.length(1)
                res.body.items.should.be.a('array')
                res.body.should.have.property('status')
                res.body.status.should.equal("Successfully deleted some items.")
                done()
            })
    })
    it("should throw an error on POST to an ID that exists", function(done) {
        chai.request(app)
            .post('/items')
            .send({
                'name': 'Kale',
                'id': 1
            })
            .end(function(err, res) {
                // should.equal(err, null)
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.should.be.json
                res.body.should.have.property('error')
                res.body.error.should.equal("The ID you've specified already exists. POSTing is intended for new entries, not replacing one. Please try REPLACE instead.")
                done()
            })
    })
    it("should throw an error on a POST without body data", function(done) {
        chai.request(app)
            .post('/items')
            .send({})
            .end(function(err, res) {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.should.be.json
                res.body.should.have.property('error')
                res.body.error.should.equal("Your request appears invalid. Please pass valid JSON in the form of {name: item}.")
                done()
            })
    })
    it("should throw an error on POST with something other than valid JSON", function(done) {
        chai.request(app)
            .post('/items')
            .send("{bauble;id:5, slam: true}")
            .end(function(err, res) {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.should.be.json
                res.body.should.have.property('error')
                res.body.error.should.equal("Your request appears invalid. Please pass valid JSON in the form of {name: item}.")
                done()
            })
    })
    it("should automatically handle a PUT without an ID in the endpoint", function(done) {
        chai.request(app)
            .put('/items/')
            .send({
                'name': 'New 3 Cola - No Longer Kale Flavored'
            })
            .end(function(err, res) {
                // shouldn't trigger an error provided the other information
                // is in good order ...
                should.equal(err, null)
                res.should.be.json
                res.should.have.status(200)
                res.body.should.have.property('added')
                res.body.added.should.be.a('object')
                res.body.added.should.have.property('name')
                res.body.added.name.should.equal("New 3 Cola - No Longer Kale Flavored")
                res.body.status.should.contain("did not appear as a valid ID in original list; appended to the shopping list.")
                done()
            })
    })
    it('should THEN reflect the newly-added/"replaced" item', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null)
                res.should.have.status(200)
                res.should.be.json
                res.body.should.be.a('array')
                // Because we just DELETED an object, well, we still have 4 ...
                res.body.should.have.length(4)
                res.body[3].should.be.a('object')
                res.body[3].should.have.property('id')
                res.body[3].should.have.property('name')
                res.body[3].id.should.be.a('number')
                res.body[3].name.should.be.a('string')
                res.body[3].name.should.equal('New 3 Cola - No Longer Kale Flavored')
                done()
            })
    })
    // Respectfully, it should handle this put by throwing an error. If they're
    // using PUT, they intend to replace a very specific item - "handling" the error may lead
    // to duplicate ID's in the list at the least. i.e. we 'handle' this by ignoring the endpoint
    // parameter 'n' and tacking it to the end of the list, but retaining the ID - or just ignoring
    // the object's ID? At that point why aren't we sheparding developers/users to just using POST to ADD?
    it("should handle a PUT with different ID in the endpoint than the body", function(done) {
        chai.request(app)
            .put('/items/1')
            .send({
                'name': 'Nuka Cola Quantum 5 - The Freshmaker!',
                'id': 5
            })
            .end(function(err, res) {
                should.not.equal(err, null)
                res.should.be.json
                res.should.have.status(400)
                res.body.should.have.property('error')
                res.body.error.should.be.a('string')
                res.body.error.should.contain("does not match the ID defined in the object")
                done()
            })
    })
    // This was a really dumb edge case. This would really complicate storage.id counting for no good reason.
    // If anything it should throw an error for such an ID.
    // it("should automatically PUT to an ID that doesn't exist")
    it("should bounce, and throw an error for, a PUT without body data", function(done) {
        chai.request(app)
            .put('/items/4')
            .send(null)
            .end(function(err, res) {
                // shouldn't trigger an error provided the other information
                // is in good order ...
                should.not.equal(err, null)
                res.should.be.json
                res.should.have.status(400)
                res.body.should.have.property('error')
                res.body.error.should.be.a('string')
                res.body.error.should.contain("Request refused. To replace a valid item, we need body data.")
                done()
            })
    })
    it("throw an error for a PUT with something other than valid JSON")
    it("throw an error for a DELETE an ID that doesn't exist")
    it("handle a DELETE without an ID in the endpoint")
})