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
  load(index)
});
