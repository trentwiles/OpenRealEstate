const connect = require("./connect.js");
const { setIntervalAsync, clearIntervalAsync } = require("set-interval-async");
const pdf = require("html-pdf");
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// builds the date directory under tmp if not already created
function ensureDirSync(dirPath) {
  const segments = dirPath.split(path.sep);
  for (let i = 1; i <= segments.length; i++) {
    const dir = path.join(...segments.slice(0, i));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
}

function generateRow(key, value) {
  return `
  <tr>
    <td>${key}</td>
    <td>${value}</td>
  </tr>
  `
}

async function manageBatchJobs(input) {
  const conn2 = await connect.init();
  const data = await conn2
    .find({ _id: new ObjectId(input["idDecoded"]) })
    .toArray();

  var html = "";

  if (data.length == 0) {
    html = "<i>404: Property Not Found</i>";
  } else {
    var api = data[0];
    /*
    TODO: Complete this PDF export!!!
    Additionally, add null checks!
    */
    html = `
    <center>
    <table>
      <tr>
        <th></th>
        <th></th>
      </tr>
      ${generateRow("Street Address", api["streetAddress"])}
      ${generateRow("Property Taxes", api["taxes"] + '(' + api["taxYear"] + ')')}
    </table>
    <i>Exported at ${new Date()} from IP address ${input["ipAddress"]}</i>
    </center>
    `;
  }

  const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "20mm",
    },
    footer: {
      height: "20mm",
      contents: {
        default: "Example Footer Change Later",
      },
    },
    childProcessOptions: {
      env: {
        OPENSSL_CONF: "/dev/null",
      },
    },
  };

  const date = new Date();
  const month = date.getMonth() + 1; // Adding 1 to make it 1-12
  const day = date.getDate();
  const year = date.getFullYear();
  const uuid = uuidv4();

  const urlFilePath = `http://localhost:3001/uploads/${year}/${month}/${day}/${uuid}.pdf`;
  const filePath = path.join(
    __dirname,
    "tmp",
    year.toString(),
    month.toString(),
    day.toString(),
    `${uuid}.pdf`
  );
  ensureDirSync(path.dirname(filePath));

  pdf.create(html, options).toFile(filePath, (err, res) => {
    if (err) return console.error("Error creating PDF:", err);
    console.log("PDF created:", res);
  });

  return { url: urlFilePath, filePath: filePath };
}

async function updateCompleted(input, downloadLink) {
  // Mark a job as completed
  const conn = await connect.initCustom("batchJobs");
  await conn.updateOne(
    { _id: input["_id"] },
    {
      $set: {
        downloadLink: downloadLink["url"],
        isCompleted: true,
        internalPath: downloadLink["filePath"],
      },
    }
  );
}

const timer = setIntervalAsync(async () => {
  const conn = await connect.initCustom("batchJobs");
  const results = await conn.find({ isCompleted: false }).toArray();
  results.forEach(async (input) => {
    const dl = await manageBatchJobs(input);
    await updateCompleted(input, dl);
  });
  console.log(results);
}, 1000);
