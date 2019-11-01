// Grab the articles as a json


$(document).on("click", "scrape", function() {
    axios.get("http://www.huffpost.com/").then(function(response) {
        var $ = cheerio.load(response.data);
        // console.log(response.data);

        $(".js-zone-twilight div.card__content").each(function(i, element) {
            //console.log($(this));
            var result = {};

            result.title = $(this).find("div.card__headline__text").text().trim();
            result.image = $(this).find("img.card__image__src").attr("src");
            result.blurb = $(this).find("a.card__link").text().trim();
            result.author = $(this).find("a.yr-author-name").text().trim();


            // If there's a note in the article
            if (data.comment) {
                $("#titleinput").val(data.comment.title);
                $("#bodyinput").val(data.comment.body);
            }
        });
    });
});

// When you click the savecomment button
$(document).on("click", "#saveComment", function(event) {

    event.preventDefault();
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    $.ajax({
            method: "POST",
            url: "/article/" + thisId,
            data: {
                title: $("#titleinput").val(),
                body: $("#bodyinput").val(),
            }
        })
        .then(function(data) {
            location.reload();
        });

    $("#titleinput").val("");
    $("#bodyinput").val("");
});