function mapSetup(id, poly) {
  const map = L.map(id).setView([0,0], 0); // Set initial coordinates and zoom level

  // Add a tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const polygon = L.polygon(poly, { color: 'blue' }).addTo(map);

  map.fitBounds(polygon.getBounds(), { padding: [1, 1] });
  map.invalidateSize();
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
  console.log(input)
  var mv = input["verboseTransaction"]["lastMarketSale"]["value"]
  if(mv == null){
    var salePrice = "an unknown amount"
  }else{
    var salePrice = `$${mv.toLocaleString("en-US")}`;
  }
  
  var type = input["landUse"].toLowerCase()
  // times 1000 for javascript's built in date function
  var epoch = convertEpochToReadableTime(input["scrapedAt"] * 1000);
  return `Property was last sold for ${salePrice}, clasified as "${type}".<br />
          Scraped at <time>${epoch}</time>
          `;
}

// input should be data["results"][0]
function addPropertyBox(input) {
  const randomMapID = `map${Math.floor(Math.random() * 10000)}`
  const html = `
                <div class="column is-one-third">
                  <div class="card">
                        <div class="card-image">
                            <figure class="image is-2by1">
                                <div id="${randomMapID}" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;" class="mapbox">
                                </div>
                            </figure>
                        </div>
                        <a href="${"/p/" + btoa(input["_id"])}" id="cardOneLink">
                            <div class="card-content">
                                <div class="media">
                                    <div class="media-left">
                                        <figure class="image is-48x48">
                                            <img id="image1" src=${determinePlaceholderImage(input["landUse"])}
                                                alt="Placeholder image" />
                                        </figure>
                                    </div>
                                    <div class="media-content">
                                        <p class="title is-4" id="town1">${input["streetAddressDetails"]["town"]}</p>
                                        <p class="subtitle is-6" id="state1">${input["streetAddressDetails"]["state"]}</p>
                                    </div>
                                </div>

                                <div class="content" id="content1" style="color:black;">
                                    ${generateInfo(input)}
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
              </div>
  `

  $("#appendHere").append(html)

  console.log("adding " + randomMapID)

  // after adding, set the map
  mapSetup(randomMapID, wktToLeaflet(input["geoPolygon"]["wkt"]));
}

$(document).ready(function () {
  $.get(`${API_URL}/random?limit=3`, function (data, status) {
    if (status == "success") {
      addPropertyBox(data["results"][0])
      addPropertyBox(data["results"][1])
      addPropertyBox(data["results"][2])
    }
  })
  .fail(function (xhr, status, error) {
    $("#body").html(OFFLINE)
  });
});
