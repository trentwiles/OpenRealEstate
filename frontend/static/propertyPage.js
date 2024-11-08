function parseURL() {
    const url = new URL(window.document.location + "");
    var spl = url.pathname.split("/")
    return spl[2];
}
var data = {"id": parseURL()}

$(document).ready(function () {
  $.ajax({
    url: `${API_URL}/property`,
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status) {
      if (status === "success") {
        // fill in values here
      }
    },
    error: function (xhr) {
      if (xhr.status === 404) {
        alert("404 not found. Please check the URL.");
      } else {
        $("#body").html("OFFLINE");
      }
    }
  });
});