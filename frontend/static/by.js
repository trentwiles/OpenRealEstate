var index = 1

function load(api_path, indexName, page) {
    $("#nextButton").hide()
    $("#appendHere").empty()
    $.get(`${API_URL}/${api_path}/${page}`, function (data) {
        data.forEach(element => {
            if(element[indexName] != null) {
                const html = `
                <div class="column is-one-third">
                    <a href="/search?lastName=${encodeURIComponent(element.lastName)}">${element.lastName}</a>
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
    load(index)
}

$(document).ready(function () {
    // first we need to make sure the page is valid
    switch(type) {
        case "by-town":
            // api response will look like:
            /**
             * [{"town":"Boston"},{"town":"Uxbridge"}...]
             */
            load("by-town", "town", 1)
            break;
        case "by-last-name":
            // api response will look like:
            /**
             * [{"lastName":"A PAPAGNO"},{"lastName":"A PAUL"}...]
             */
            load("last-names", "lastName", 1)
            break;
        default:
            alert("invalid!")
    }
  load(index)
});
