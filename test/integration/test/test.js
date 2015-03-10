var db = require('../models/db');
var Populator = require('../../../src/MongooseDbPopulator');
var chai = require('chai');
var expect = chai.expect;

describe('models', function () {
    beforeEach( function (done) {
        // you are responsible for the connection to mongodb instance!!!
        db.mongoose.connect('mongodb://localhost:27017/mdp', done);
    });

    afterEach( function (done) {
        // you are responsible for disconnection from mongodb
        db.mongoose.connection.close(done);
    });

    beforeEach( function (done) {
        // populate db
        var pop = new Populator();
        pop.model(require('./support/model'));
        pop.suite(require('./support/suite'));
        this.suite = pop.populate('main', done);
    });

    it('should populate db with 7 authors', function (done) {
        db.Author.find({}, function (err, authors) {
            if (err) return done(err);
            expect(authors).to.have.length(7);
            done();
        });
    });

    it('should populate db with 3 books', function (done) {
        db.Book.find({}, function (err, books) {
            if (err) return done(err);
            expect(books).to.have.length(3);
            done();
        });
    });

    it('should allow to get the first created doc with suite.getFirst(modelName)', function () {
        var book = this.suite.getFirst('Book');
        expect(book.title).to.equal('First book by four authors');
    });

    it('should allow to get a random document using suite.getRandom(modelName) ', function () {
        var book = this.suite.getRandom('Book');
        expect(book.title).to.include('book');
    });


});
