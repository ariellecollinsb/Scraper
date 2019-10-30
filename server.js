var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });


app.get("/scrape", function(req, res) {
    axios.get("http://www.huffpost.com/").then(function(response) {
        var $ = cheerio.load(response.data);
        console.log(response.data);

        $("div.card__content").each(function(i, element) {

            var result = {};

            result.title = $(this).children("div.card_headline").text().trim();
            result.image = $(this).children("a.card_image_src").attr("href");
            result.blurb = $(this).children("a.card_link").attr("href");
            result.author = $(this).children("div.author_list").text().trim();
            //create new article using result object
            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    res.json(err);
                });
        });
        console.log()
        res.send("Scrape Complete");
    });
});

//get all articles from db
app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(articles) {
            res.json(articles);
        })
        .catch(function(err) {
            res.json(err);
        });
});

//get article by id + populate comment
app.get("/articles/:id", function(req, res) {
    db.articles.findOne({ _id: req.params.id })
        .populate("comment")
        .then(function(article) {
            res.json(article);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/article/:id", function(req, res) {
    var id = req.params.id
    db.articles.findById(id)
        .populate("comment")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});



// Route for saving/updating an Article's associated comment
app.post("/article/:id", function(req, res) {
    db.Comment.create(req.body)
        .then(function(dbComment) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});


app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});