var index = 1

function load(page) {
    $("#nextButton").hide()
    $("#appendHere").empty()
    $.get(`${API_URL}/last-names/${page}`, function (data) {
        data.forEach(element => {
            if(element["lastName"] != null) {
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
            console.log("Valid!")
            break;
        case "by-last-name":
            console.log("Valid too!");
            break;
        default:
            alert("invalid!")
    }
  load(index)
});
