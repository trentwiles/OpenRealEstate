var index = 1
var api_route = ""
var indexName = ""

function load(api_path, indexName, page) {
    $("#nextButton").hide()
    $("#appendHere").empty()
    $.get(`${API_URL}/${api_path}/${page}`, function (data) {
        data.forEach(element => {
            console.table(element)
            if(element[indexName] != null || element[indexName] != undefined) {
                const html = `
                <div class="column is-one-third">
                    <a href="/search?${indexName}=${encodeURIComponent(element[indexName])}">${element[indexName]}</a>
                </div>
                `
                $("#appendHere").append(html)
                console.log(html)
            }
        });
        $("#nextButton").show()
      }).fail(function () {
        $("#body").html(OFFLINE)
      });
}

function next() {
    index++
    load(api_route, indexName, index)
}

$(document).ready(function () {
    // first we need to make sure the page is valid
    switch(type) {
        case "by-town":
            // api response will look like:
            /**
             * [{"townName":"Boston"},{"townName":"Uxbridge"}...]
             */
            api_route = "town-names"
            indexName = "townName"
            load(api_route, indexName, 1)
            break;
        case "by-last-name":
            // api response will look like:
            /**
             * [{"lastName":"A PAPAGNO"},{"lastName":"A PAUL"}...]
             */
            api_route = "last-names"
            indexName = "lastName"
            load(api_route, indexName, 1)
            break;
        default:
            alert("invalid!")
    }
});
