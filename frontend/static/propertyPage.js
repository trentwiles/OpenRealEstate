function parseURL() {
    const url = new URL(window.document.location + "");
    var spl = url.pathname.split("/")
    return spl[2];
}
$(document).ready(function () {
  $.post(`${API_URL}/property`, function (data, status) {
    if (status == "success") {
      // fill in values here
    }else{
      alert("404 not found replace this")
    }
  }).fail(function () {
    $("#body").html(OFFLINE)
  });
});