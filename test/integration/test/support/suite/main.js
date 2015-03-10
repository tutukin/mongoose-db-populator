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
