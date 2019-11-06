var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    blurb: {
        type: String,
        required: true
    },
    author: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    comment: [{
        title: {type: String},
        body: {type: String}
    }]
});


var Article = mongoose.model("Article", ArticleSchema);


module.exports = Article;