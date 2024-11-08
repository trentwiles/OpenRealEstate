function handleForm(limit) {
  var formData = new FormData(document.querySelector("form"));
  if (
    formData.get("minPrice") != "" &&
    formData.get("maxPrice") != "" &&
    formData.get("minPrice") != formData.get("maxPrice")
  ) {
    var priceRange = formData.get("minPrice") + "-" + formData.get("maxPrice");
    formData.delete("minPrice");
    formData.delete("maxPrice");
    formData.append("marketPriceRange", priceRange);
  }

  if (formData.get("startDate") != "" && formData.get("endDate") != "") {
    var startDateYear = formData.get("startDate").split("-")[0];
    var endDateYear = formData.get("endDate").split("-")[0];
    var buildDateRange = startDateYear + "-" + endDateYear;
    formData.delete("startDate");
    formData.delete("endDate");
    formData.append("yearBuilt", buildDateRange);
  }

  const formItemsToDelete = [];

  formData.forEach((value, key) => {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      formItemsToDelete.push(key);
    }
  });

  formData.append("limit", limit)

  formItemsToDelete.forEach((key) => formData.delete(key));

  // form data is a crappy format, we should convert to JSON for the API
  var preJSON = {};
  formData.forEach((v, k) => {
    preJSON[k] = v;
  });

  return JSON.stringify(preJSON);
}

function reset() {
  updatePriceRange()
  $("#landUse").val("")
  $("#owner").val("")
  $("#town").val("")
  $("#state").val("")
  $("#startDate").val("")
  $("#endDate").val("")
  $("#minPriceSlider").val(500000) 
  $("maxPriceSlider").val(500000)
  updatePriceRange()
}

function toTitleCase(name) {
  console.log(`DEBUG: ${name} is a ${typeof name}`)
  if (name == null || name == "" || name == undefined) {
    return "Unknown"
  }
  // for some reason above, the conditions do not catch all invalid "names"
  try{
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }catch{
    return name
  }
}

function decodeOwners(owners) {
  // pass in metadata["owners"]
  if (owners.length == 0) {
    return "Unknown";
  }
  var names = ""
  owners.forEach( name => {
    names += "and " + toTitleCase(name["fullName"])
  })

  // removes the first "and "
  return names.substring(4)
}

function searchResultFactory(metadata) {
  // assumes metadata is in API format

  var shortAddress = metadata["streetAddressDetails"]["town"] + ", " + metadata["streetAddressDetails"]["state"]
  var streetAddress = metadata["streetAddress"].split(",")[0]
  var owners = decodeOwners(metadata["owner"])
  var landUse = toTitleCase(metadata["landUse"])
  var buildYear = toTitleCase(metadata["yearBuilt"])
  var value = metadata["marketValue"]

  return `
  <a href='/p/${metadata["id"]}/'>
    <div class="box">
      <h3 class="title is-4">${streetAddress}</h3>
      <p><strong>Location:</strong> ${shortAddress}</p>
      <p><strong>Owner(s):</strong> ${owners}</p>
      <p><strong>Land Use:</strong> ${landUse}</p>
      <p><strong>Build Year:</strong> ${buildYear}</p>
      <p><strong>Evaluation:</strong> $${value}</p>
    </div>
  </a>
  <br>
  `
}

$(document).ready(function () {
  updatePriceRange() 
  $("#submitButton").click(function (event) {
    event.preventDefault(); // Prevent form submission

    // Reset search results
    $("#searchResultsHolder").html("")

    // Disable the button to prevent spamming
    $(this).prop("disabled", true);

    // Default limit of 5, allow user to change in the future?
    const query = handleForm(5);
    $("#searchResultsHolder").append("<center><img src='https://trentwil.es/a/Basketball.gif' /></center>")
    $.post(
      {
        url: `${API_URL}/search`,
        contentType: "application/json",
        dataType: "json",
        data: query,
      },
      function (result) {
        $("#searchResultsHolder").html("")
        if(result["results"].length == 0) {
          $("#searchResultsHolder").append("<p>Sorry, no results.</p>")
        }else{
          result["results"].forEach((mta) => {
            $("#searchResultsHolder").append(searchResultFactory(mta))
          })
        }

        $("#submitButton").prop("disabled", false);
      }
    ).fail(function () {
      $("#searchResultsHolder").html("")
      $("#submitButton").prop("disabled", false);
      $("#searchResultsHolder").append(`<span style="color:red;">An error occurred. Please try again.</span>`);
    });
  });
});
