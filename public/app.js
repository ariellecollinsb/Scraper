// Grab the articles as a json
/*
$.getJSON("/article", function(data) {
    for (var i = 0; i < data.length; i++) {
        $("#article").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].blurb + "<br />" + data[i].image + "<br />" + data[i].author + "</p>");
    }
});
$(document).on("click", "a", function() {
    $("#comments").empty();
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/article/" + thisId
        })
        // With that done, add the note information to the page
        .then(function(data) {
            console.log(data);
            $("#comments").append("<h2>" + data.title + "</h2>");
            $("#comments").append("<input id='titleinput' name='title' >");
            $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
            $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

            // If there's a note in the article
            if (data.comment) {
                $("#titleinput").val(data.comment.title);
                $("#bodyinput").val(data.comment.body);
            }
        });
});
*/
// When you click the savenote button
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