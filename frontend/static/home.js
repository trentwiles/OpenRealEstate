function generateInfo(input) {
  salePrice = `$${input["marketValue"].toLocaleString("en-US")}`;
  return `Home with a market value of ${salePrice}`;
}

$(document).ready(function () {
  $.get("http://localhost:3000/random?limit=3", function (data, status) {
    if (status == "success") {
      $("#title1").text(data["results"][0]["streetAddress"]);
      $("#title2").text(data["results"][1]["streetAddress"]);
      $("#title3").text(data["results"][2]["streetAddress"]);
    }
  });
});
