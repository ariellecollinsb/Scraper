var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("http://www.huffpost.com/").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        console.log(response.data);
        // Now, we grab every h2 within an article tag, and do the following:
        $("div.card__content").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("div.card_headline").text().trim();
            result.image = $(this).children("a.card_image_src").attr("href");
            result.blurb = $(this).children("a.card_link").attr("href");
            result.author = $(this).children("div.author_list").text().trim();
            // Create a new Article using the `result` object built from scraping
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

app.get("/", function(req, res) {
    db.index.find({}, function(err, data) {
        if (err) return res.status(500).end();
    })
    res.json(data);
});
// Route for getting all Articles from the db
app.get("/article", function(req, res) {
    db.articles.find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        })
});

app.get("/comment", function(req, res) {
    db.Comment.find({})
        .then(function(dbComment) {
            res.json(dbComment);
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


    app.post("/submit", function(req, res) {
        // Create a new Note in the db
        db.Comment.create(req.body)
            .then(function(dbComment) {
                var id = req.params.id
                return db.articles.findOneAndUpdate({}, { $push: { comment: dbComment._id } }, { new: true });
            })
            .then(function(dbUser) {
                res.json(dbUser);
            })
            .catch(function(err) {
                res.json(err);
            });
    });

});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});