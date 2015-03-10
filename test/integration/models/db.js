var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authorSchema = new Schema({
    name:   String
});

var bookSchema = new Schema({
    title:  String,
    authors: [authorSchema]
});

module.exports = {
    mongoose: mongoose,
    Author: mongoose.model('Author', authorSchema),
    Book:   mongoose.model('Book', bookSchema)
};
