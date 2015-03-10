# mongoose-db-populator

This module helps to populate the MongoDB with documents for testing purposes.
It also cleans the database (absolutely all collections).

```javascript
  describe('models', function () {
    beforeEach( function (done) {
        // you are responsible for the connection to mongodb instance!!!
        db.mongoose.connect('mongodb://localhost:27017/mdp', done);
    });

    afterEach( function (done) {
        // you are responsible for disconnection from mongodb instance!!!
        db.mongoose.connection.close(done);
    });

    beforeEach( function (done) {
        // populate db
        var pop = new Populator();

        // use these model factories to create documents
        pop.model(require('./support/model'));

        // use these suite factories to populate db
        pop.suite(require('./support/suite'));

        // remove absolutely all docs from db
        // and populate db using "main" suite
        this.suite = pop.populate('main', done);
    });

    it('should populate db with 7 authors', function (done) {
        db.Author.find({}, function (err, authors) {
            if (err) return done(err);
            expect(authors).to.have.length(7);
            done();
        });
    });
  });
```

Please, refer to `test/integration/test.js` for details!


## model factory

It's goal is to create a valid mongoose document
using your options or some defaults

```javascript
// ./support/model/Book.js
//
// ./support/model exports { Book : require('./Book')}
// e.g. using require-directory module
//

// here your models are defined
// db.Book === mongoose.model('Book')
var db = require('../../../models/db');

var i = 1;

module.exports = function bookFactory (options) {
    options = options || {};

    var bookDoc = {
        title:      options.title || 'Book title #' + i,
        authors:    options.authors || []
    };

    i++;

    return new db.Book(bookDoc);
};
```

## suite factory

It's purpose to create all the required documents. Internally model factories are used

```javascript
// ./support/suite/main
//
// ./support/suite exports { main : require('./main')}
// e.g. using require-directory module
//
module.exports = function mainSuite () {
    // this refers to the instance of Suite
    var suite = this;

    var authors1 = [0,1,2,3].map( function () {
        return suite.create('Author');
    });

    var authors2 = [0,1,2].map( function () {
        return suite.create('Author');
    });

    var book1 = suite.create('Book', {
        title: 'First book by four authors',
        authors: authors1
    });

    var book2 = suite.create('Book', {
        title: 'Second book by three authors',
        authors: authors2
    });

    var book3 = suite.create('Book', {
        title: 'Last book - no authors'
    });
};

```
