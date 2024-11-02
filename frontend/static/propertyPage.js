function parseURL() {
    const url = new URL(window.document.location + "");
    var spl = url.pathname.split("/")
    return spl[2];
}
$(document).ready(function () {
  $.get(`${API_URL}/id?id=${parseURL()}`, function (data, status) {
    if (status == "success") {
    }
  });
});