var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var async = require('async');

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3000;
var app = express();
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
    axios.get("http://www.dailydot.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        console.log(response.data);
        var newArticles = 0;
        var results = [];
        $(".dd-well-card.dd-well-card-post").each(function(i, el) {
            results.push({
                title: $(this).find(".dd-card-headline").text().trim(),
                image: $(this).find(".dd-card-leadart").attr("src"),
                blurb: $(this).find(".dd-card-summary").text().trim(),
                author: $(this).find(".dd-card-byline").text().trim(),
                url: $(this).find(".dd-card-leadart-container > a").attr("href")
            })
        });
        console.log(results);
        /*
        $(".js-zone-twilight div.card__content").each(function (i, element) {
            var result = {};
            result.title = $(this).find("div.card__headline__text").text().trim();
            result.image = $(this).find("img.card__image__src").attr("src");
            result.blurb = $(this).find("a.card__link").text().trim();
            result.author = $(this).find("a.yr-author-name").text().trim();
            results.push(result);
        });*/

        // https://stackoverflow.com/a/10552398
        var calls = [];
        results.forEach(function (result) {
            calls.push(function (callback) {
                db.Article.count({ title: result.title }, function (err, count) {
                    if (count === 0) {
                        db.Article.create(result)
                            .then(function (dbArticle) {
                                newArticles++;
                                callback(null, result);
                            })
                            .catch(function (err) {
                                return callback(err);
                            });
                    } else {
                        callback(null, result);
                    }
                });
            });
        });

        async.parallel(calls, function (err, result) {
            if (err) { return console.log(err); }
            res.json({ count: newArticles });
        });
    });
});

//get all articles from db
app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (articles) {
            res.render("index", { article: articles });
        })
        .catch(function (err) {
            res.json(err);
        });
});

//get article by id + populate comment
app.get("/article/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .then(function (article) {
            console.log(article);
            res.render("article", { article: article });
        })
        .catch(function (err) {
            res.json(err);
        });
});


// Route for saving/updating an Article's associated comment
// app.post("/article/:id", function (req, res) {
//     db.Comment.create(req.body)
//         .then(function (dbComment) {
//             return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
//         })
//         .then(function (dbArticle) {
//             res.json(dbArticle);
//         })
//         .catch(function (err) {
//             res.json(err);
//         });
// });

app.post("/article/:id", function(req, res){
    db.Article.findOne({_id: req.params.id})
    .then(function(article){
        console.log(article);
        article.comment.push({title: req.body.title, body: req.body.body})
        article.save();
        res.json(article);
    })
})

app.delete("/article/:articleId/:commentId", function(req, res) {
    db.Article.findOne({_id: req.params.articleId})
    .then(function(article) {
        var index = article.comment.findIndex(function(comment) {
            return comment._id.toString().trim() === req.params.commentId.trim();
        });
        if (index > -1) {
            article.comment.splice(index, 1);
            article.save();
        }
        res.json(article);
    });
});


// app.get("/article/:id", function(req, res) {
//     db.Article.findOne({ _id: req.params.id })
//         .delete("comment")
//         .then(function(article) {
//             res.json(article)
//         })

// });

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
