// objective: convert WKT format into a leaflet polygon
function wktToLeaflet(wkt) {
  const coordinatesText = wkt.slice(9, -2).trim();

  // Split into pairs, parse each coordinate, and filter out invalid pairs
  return coordinatesText
    .split(",")
    .map((coordPair) => {
      // Split by whitespace and parse each part to a number
      const [lng, lat] = coordPair.trim().split(" ").map(Number);

      // Check if both latitude and longitude are valid numbers
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng]; // Return in [lat, lng] format for Leaflet
      }
    })
    .filter((coord) => coord !== undefined);
}
