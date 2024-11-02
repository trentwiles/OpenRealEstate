function handleForm() {
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

function searchResultFactory(metadata) {
  // assumes metadata is in API format

  var cityTown = metadata["streetAddressDetails"]["town"] + ", " + metadata["streetAddressDetails"]["state"]
}

$(document).ready(function () {
  updatePriceRange() 
  $("#submitButton").click(function (event) {
    event.preventDefault(); // Prevent form submission

    // Disable the button to prevent spamming
    $(this).prop("disabled", true);

    const query = handleForm();
    $("#result").html("Please agree to terms of service before searching...");
    $.post(
      {
        url: "http://localhost:3000/search",
        contentType: "application/json",
        dataType: "json",
        data: query,
      },
      function (result) {
        console.log(result);

        $("#submitButton").prop("disabled", false);
      }
    ).fail(function () {
      $("#submitButton").prop("disabled", false);
      $("#result").html("An error occurred. Please try again.");
    });
  });
});
