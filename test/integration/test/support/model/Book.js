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
