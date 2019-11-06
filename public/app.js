
$("#scrape").on("click", function (event) {
    event.preventDefault();

    $("#scrape").text("Scraping...");
    $.getJSON("/scrape").then(function (response) {
        $("#scrape").text("Scrape Complete");
        $('#scrapeModal .modal-body').text(`${response.count} new articles scraped.`);

        $('#scrapeModal').modal('show');
        $('#scrapeModal').on('hidden.bs.modal', function (e) {
            location.reload();
        });
        
    });


});

// When you click the savecomment button
$(document).on("click", "#saveComment", function (event) {

    event.preventDefault();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/article/" + thisId,
        data: {
            title: $("#titleinput").val(),
            body: $("#bodyinput").val(),
        }
    })
        .then(function (data) {
            location.reload();
        });

    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(document).on("click", "#deleteComment", function (event) {
    event.preventDefault();
    var dataId = $(this).attr("data-ArticleId") +"/"+ $(this).attr("data-CommentId");
    $.ajax({
        method: "DELETE",
        url: "/article/" + dataId, 
    })
        .then(function (data) {
            location.reload();
        });

});
