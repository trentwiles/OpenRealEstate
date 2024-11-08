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
        if(data["results"].length == 0) {
          // temp fix
          alert("404")
          return
        }
        /* ===============
        DEFINED VARIABLES
        ================ */
        const api = data["results"][0]

        const yearBuilt = api["yearBuilt"] || "Unknown"
        const acres = Math.round(api["landSize"]/4046.8564224) + " acres"
        const fullAddress = api["streetAddress"] || "No Listed Address"
        const town = api["streetAddressDetails"]["town"] || "Unknown"
        const state = api["streetAddressDetails"]["state"] || "Unknown"
        const zip = api["streetAddressDetails"]["zip"] || "Unknown"
        const taxes = api["taxes"] || "Unlisted"
        const taxYear = api["taxYear"] || "Unknown"
        const taxExempt = api["taxExemption"] || "None"
        const latestSaleInfo = api["lastMarketSale"]

        const latestSale = `
        <table>

        </table>
        `

        const body = `
                
        <section class="section">
          <div class="container">
            <h1 class="title">Property Listing</h1>

            <div class="columns is-vcentered">
              
              <!-- Image Section -->
              <div class="column is-one-third">
                <figure class="image is-4by3">
                  <img src="https://via.placeholder.com/800x600" alt="Property Image">
                </figure>
              </div>

              <!-- Details Section -->
              <div class="column">
                <div class="box">
                  <h2 class="subtitle">Property Details</h2>

                  <table class="table is-fullwidth is-striped">
                    <tbody>
                      <tr>
                        <th>Location</th>
                        <td>123 Main St, Springfield</td>
                      </tr>
                      <tr>
                        <th>Price</th>
                        <td>$450,000</td>
                      </tr>
                      <tr>
                        <th>Bedrooms</th>
                        <td>3</td>
                      </tr>
                      <tr>
                        <th>Bathrooms</th>
                        <td>2</td>
                      </tr>
                      <tr>
                        <th>Square Footage</th>
                        <td>1,800 sq ft</td>
                      </tr>
                      <tr>
                        <th>Lot Size</th>
                        <td>5,000 sq ft</td>
                      </tr>
                      <tr>
                        <th>Year Built</th>
                        <td>2005</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </section>
        `
      }else{
        // 404 or other error handling
      }
    },
    error: function (xhr) {
      $("#body").html(OFFLINE);
    }
  });
});