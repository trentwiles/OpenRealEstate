const connect = require("./connect.js")
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');
const pdf = require('html-pdf');
const { ObjectID } = require("mongoose")
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

function ensureDirSync(dirPath) {
  const segments = dirPath.split(path.sep);
  for (let i = 1; i <= segments.length; i++) {
    const dir = path.join(...segments.slice(0, i));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
}

async function manageBatchJobs(input) {
  const html = `
  <h1>test</h1>
  `

  const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm',
      header: {
          height: '20mm',
      },
      footer: {
          height: '20mm',
          contents: {
              default: 'Example Footer Change Later',
          },
      },
  };

  

  const date = new Date();
  const month = date.getMonth() + 1; // Adding 1 to make it 1-12
  const day = date.getDate();
  const year = date.getFullYear();
  const uuid = uuidv4();

  const urlFilePath = `http://localhost:3001/uploads/${year}/${month}/${day}/${uuid}.pdf`
  const filePath = path.join(__dirname, 'tmp', year.toString(), month.toString(), day.toString(), `${uuid}.pdf`);
  ensureDirSync(path.dirname(filePath));
  
  pdf.create(html, options).toFile(filePath, (err, res) => {
      if (err) return console.error('Error creating PDF:', err);
      console.log('PDF created:', res);
  });

  return urlFilePath
}

async function updateCompleted(input, downloadLink) {
  // Mark a job as completed
  const conn = await connect.initCustom("batchJobs");
  await conn.updateOne(
    { "_id": input["_id"] },
    { $set: { "downloadLink": downloadLink, "isCompleted": true } }
  );
}

const timer = setIntervalAsync(async () => {
  const conn = await connect.initCustom("batchJobs")
  const results = await conn.find({"isCompleted": false}).toArray()
  results.forEach(async (input) => {
    const dl = await manageBatchJobs(input)
    await updateCompleted(input, dl);
  })
  console.log(results)
}, 1000);
