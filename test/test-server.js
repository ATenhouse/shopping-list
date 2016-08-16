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
            .delete('/items/1')
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
                'id': 1,
                'name': 'Kale'
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
                res.body.error.should.equal("Nothing was specified to add to the shopping list. Please pass something in the form of {name: item}.")
                done()
            })
    })
    it("should throw an error on POST with something other than valid JSON")
    it("should automatically handle a PUT without an ID in the endpoint")
    it("should handle a PUT with different ID in the endpoint than the body")
    it("should automatically PUT to an ID that doesn't exist")
    it("should bounce, and throw an error for, a PUT without body data")
    it("throw an error for a PUT with something other than valid JSON")
    it("throw an error for a DELETE an ID that doesn't exist")
    it("handle a DELETE without an ID in the endpoint")
})