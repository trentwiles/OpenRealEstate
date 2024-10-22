const theFunctions = require("./server");

console.log(
  theFunctions.queryBuilder({
    time: "1-200",
    marketPriceRange: "1000-4000",
    town: "Oakland",
    zip: "03948",
  })
);
