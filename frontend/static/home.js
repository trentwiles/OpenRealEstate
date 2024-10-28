function mapSetup(id, lat, lon) {
  const map = L.map(id).setView([lat, lon], 13); // Set initial coordinates and zoom level

  // Add a tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Optional: Add a marker to the map
  L.marker([lat, lon]).addTo(map).openPopup();
}

function convertEpochToReadableTime(epochMillis) {
  const date = new Date(epochMillis);
  return date.toLocaleString(); // This will use the default locale and format
}

function generateInfo(input) {
  var salePrice = `$${input["marketValue"].toLocaleString("en-US")}`;
  var type = input["landUse"].toLowerCase()
  // times 1000 for javascript's built in date function
  var epoch = convertEpochToReadableTime(input["scrapedAt"] * 1000);
  return `Property with a market value of ${salePrice}, clasified as "${type}".<br />
          Scraped at <time>${epoch}</time>
          `;
}

$(document).ready(function () {
  $.get("http://localhost:3000/random?limit=3", function (data, status) {
    if (status == "success") {
      $("#houses").fadeIn();
      mapSetup("map1", 72, 42);
      $("#town1").text(data["results"][0]["streetAddressDetails"]["town"]);
      $("#state1").text(data["results"][0]["streetAddressDetails"]["state"]);
      $("#content1").html(generateInfo(data["results"][0]))

      mapSetup("map2", 50, 39);
      $("#town2").text(data["results"][1]["streetAddressDetails"]["town"]);
      $("#state2").text(data["results"][1]["streetAddressDetails"]["state"]);
      $("#content2").html(generateInfo(data["results"][1]))

      mapSetup("map3", 75, 40);
      $("#town3").text(data["results"][2]["streetAddressDetails"]["town"]);
      $("#state3").text(data["results"][2]["streetAddressDetails"]["state"]);
      $("#content3").html(generateInfo(data["results"][2]))
    }
  });
});
