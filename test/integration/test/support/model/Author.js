var db = require('../../../models/db');

var i = 1;

module.exports = function authorFactory (options) {
    options = options || {};

    var authorDoc = {
        name:   options.name || 'Author #'+i
    };

    i++;

    return new db.Author(authorDoc);
};
