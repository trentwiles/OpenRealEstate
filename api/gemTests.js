const gem = require("./gem");
const fs = require("fs").promises;

async function openFileHelper() {
  const data = await fs.readFile("exampleTransactions.json", "binary");
  return JSON.parse(Buffer.from(data));
}

openFileHelper().then((data) => {
  e1 = JSON.stringify(data["exampleTwo"]);
  e2 = JSON.stringify(data["exampleThree"]);
  gem.transactionHistorySummary(e1).then((result) => {
    console.log("=============== EXAMPLE ONE ===============")
    console.log(result);
  });
  gem.transactionHistorySummary(e2).then((result) => {
    console.log("=============== EXAMPLE TWO ===============")
    console.log(result);
  });
});
