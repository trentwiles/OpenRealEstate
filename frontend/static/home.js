function mapSetup(id, poly) {
  const map = L.map(id).setView([0,0], 12); // Set initial coordinates and zoom level

  // Add a tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const polygon = L.polygon(poly, { color: 'blue' }).addTo(map);

  map.fitBounds(polygon.getBounds());
}

function convertEpochToReadableTime(epochMillis) {
  const date = new Date(epochMillis);
  return date.toLocaleString(); // This will use the default locale and format
}

function determinePlaceholderImage(type) {
  type = type.toLowerCase()
  
  if(type.includes("home") || type.includes("house") || type.includes("family")){
    return "https://trentwil.es/a/vacant.png"
  }

  if(type.includes("vacant") || type.includes("abandoned") || type.includes("lot")){
    return "https://trentwil.es/a/_f02cb7ed-eaaf-4c55-b293-a6c91b0b0851.jpg"
  }

  if(type.includes("agricultural") || type.includes("farm")) {
    return "https://trentwil.es/a/OIG2.jpg"
  }

  return "https://trentwil.es/a/_7cfd872e-04a3-40ef-a3d2-3333e963ecdb.jpg"
}

function generateInfo(input) {
  var mv = input["marketValue"]
  if(mv == null){
    mv = -1
  }
  var salePrice = `$${mv.toLocaleString("en-US")}`;
  var type = input["landUse"].toLowerCase()
  // times 1000 for javascript's built in date function
  var epoch = convertEpochToReadableTime(input["scrapedAt"] * 1000);
  return `Property with a market value of ${salePrice}, clasified as "${type}".<br />
          Scraped at <time>${epoch}</time>
          `;
}

$(document).ready(function () {
  $("#loader").show()
  $.get("http://localhost:3000/random?limit=3", function (data, status) {
    if (status == "success") {
      $("#loader").hide()
      $("#houses").fadeIn();
      mapSetup("map1", wktToLeaflet(data["results"][0]["geoPolygon"]["wkt"]));
      $("#town1").text(data["results"][0]["streetAddressDetails"]["town"]);
      $("#state1").text(data["results"][0]["streetAddressDetails"]["state"]);
      $("#content1").html(generateInfo(data["results"][0]))
      $("#image1").attr("src", determinePlaceholderImage(data["results"][0]["landUse"]));

      mapSetup("map2", wktToLeaflet(data["results"][1]["geoPolygon"]["wkt"]));
      $("#town2").text(data["results"][1]["streetAddressDetails"]["town"]);
      $("#state2").text(data["results"][1]["streetAddressDetails"]["state"]);
      $("#content2").html(generateInfo(data["results"][1]))
      $("#image2").attr("src", determinePlaceholderImage(data["results"][1]["landUse"]));

      mapSetup("map3", wktToLeaflet(data["results"][2]["geoPolygon"]["wkt"]));
      $("#town3").text(data["results"][2]["streetAddressDetails"]["town"]);
      $("#state3").text(data["results"][2]["streetAddressDetails"]["state"]);
      $("#content3").html(generateInfo(data["results"][2]))
      $("#image3").attr("src", determinePlaceholderImage(data["results"][2]["landUse"]));

    }
  })
  .fail(function (xhr, status, error) {
    $("#body").html(OFFLINE)
  });
});
