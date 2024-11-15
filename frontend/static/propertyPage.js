function parseURL() {
  const url = new URL(window.document.location + "");
  var spl = url.pathname.split("/");
  return spl[2];
}

function exportPDF() {
  var data = {
    id: parseURL(),
  };

  $("#export").text("Exporting...")
  $("#export").prop("disabled", true);

  $.ajax({
    url: `${API_URL}/newExportJob`,
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status) {
      var jobID = data["jobID"];
      
      // Function to check the job status
      function checkJobStatus() {
        $.get({
          url: `${API_URL}/getJobStatus/${jobID}`,
          success: function (jdata) {
            if (jdata["isCompleted"]) {
              // Job is complete, show the download link
              $("#export").text("Done!")
              alert(jdata["downloadLink"]);
            } else {
              // Job is not complete, check again in 3 seconds
              setTimeout(checkJobStatus, 1500);
            }
          },
          error: function () {
            alert("Error checking job status. Please try again later.");
          },
        });
      }
      
      // Start checking the job status
      checkJobStatus();
    },
    error: function (xhr) {
      $("#export").text("Unable to Export");
      $("#export").prop("disabled", true);
    },
  });
}


var data = { id: parseURL() };

$(document).ready(function () {
  $.ajax({
    url: `${API_URL}/property`,
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    success: function (data, status) {
      if (status === "success") {
        if (data["results"].length == 0) {
          // temp fix
          alert("404");
          return;
        }
        /* ===============
        DEFINED VARIABLES
        ================ */
        const api = data["results"][0];

        const yearBuilt = api["yearBuilt"] || "Unknown";
        const acres = Math.round(api["landSize"] / 4046.8564224) + " acres";
        const fullAddress = api["streetAddress"] || "No Listed Address";
        const town = api["streetAddressDetails"]["town"] || "Unknown";
        const state = api["streetAddressDetails"]["state"] || "Unknown";
        const zip = api["streetAddressDetails"]["zip"] || "Unknown";
        const taxes = api["taxes"] || "Unlisted";
        const taxYear = api["taxYear"] || "Unknown";
        const taxExempt = api["taxExemption"] || "None";
        const latestSale = api["verboseTransaction"]["lastMarketSale"];

        const generalInfo = `
        <table class="table is-fullwidth is-striped">
          <tbody>
            <tr>
              <th>Location</th>
              <td>${fullAddress}</td>
            </tr>
            <tr>
              <th>Price</th>
              <td>${
                latestSale["value"] ? `$${latestSale["value"]}` : "Unknown"
              }</td>
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
        `;

        const latestSaleTable = `
        <table class="table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Sale Price</th>
              <th>Filing Date</th>
              <th>Transfer Date</th>
              <th>Lender</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${latestSale["seller"] || "Unknown"}</td>
              <td>${latestSale["buyer"] || "Unknown"}</td>
              <!-- adds $ if non-null -->
              <td>${
                latestSale["value"] ? `$${latestSale["value"]}` : "Unknown"
              }</td>
              <td>${
                latestSale["filingDate"]
                  ? new Date(latestSale["filingDate"]).toLocaleDateString(
                      "en-US"
                    )
                  : "No date available"
              }</td>
              <td>${
                latestSale["filingDate"]
                  ? new Date(latestSale["transferDate"]).toLocaleDateString(
                      "en-US"
                    )
                  : "No date available"
              }</td>
              <td>${latestSale["lender"] || "Unknown"}</td>
            </tr>
          <tbody>
        </table>
        `;

        const bodyTask = `
                
        <section class="section">
          <div class="container">
            <h1 class="title">Property Listing</h1>

            <div class="columns is-vcentered">
              
              <!-- Image Section (takes up 1/3 of the space and matches the height of the table) -->
              <div class="column is-one-third" style="display: flex; align-items: stretch;">
                <div class="box" style="flex: 1; display: flex; align-items: stretch;">
                  <img src="https://picsum.photos/500" alt="Property Image" class="image" style="object-fit: cover; height: 100%; width: 100%;"/>
                </div>
              </div>

              <!-- Details Section with Table (takes up 2/3 of the space) -->
              <div class="column is-two-thirds">
                <div class="box" style="height: 100%; display: flex; flex-direction: column;">
                  <h2 class="subtitle">Property Details</h2>
                  ${generalInfo}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <h1 class="title">Sale Details</h1>

            <div class="columns is-vcentered">
              <div class="column">
                <div class="box">
                  <h2 class="subtitle">Last Transaction</h2>
                  ${latestSaleTable}
                  </div>
              </div>

            </div>
          </div>
          <button id="export" onclick="exportPDF()" class="button is-info">Export to PDF</button>
        </section>
        `;
        $("#infoDetailsHolder").append(bodyTask);
      } else {
        // 404 or other error handling
      }
    },
    error: function (xhr) {
      $("#body").html(OFFLINE);
    },
  });
});
