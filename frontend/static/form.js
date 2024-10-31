function handleForm() {
  var formData = new FormData(document.querySelector("form"));
  if (formData.get("minPrice") != "" && formData.get("maxPrice") != "") {
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
    if (value === "" || value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
        formItemsToDelete.push(key);
    }
  });

  formItemsToDelete.forEach((key) => formData.delete(key));

  // form data is a crappy format, we should convert to JSON for the API
  var preJSON = {}
  formData.forEach((v, k) => {
    preJSON[k] = v
  })

  return JSON.stringify(preJSON);
}

$(document).ready(function () {
  $("#submitButton").click(function (event) {
    event.preventDefault(); // Prevent form submission
    const query = handleForm()
    $.post({"url": "http://localhost:3000/search", contentType: 'application/json', dataType: 'json', data: query}, function(result){
        console.log(result)
      });
  });
});
