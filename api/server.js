const express = require("express");
const { MongoClient, Int32 } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB = `mongodb://${process.env.M_USERNAME}:${process.env.M_PASSWORD}@${process.env.M_SERVER}:27017/`;

const app = express();

async function rawInit() {
  const client = new MongoClient(MONGODB);
  await client.connect();
  return client;
}

async function init() {
  const client = new MongoClient(MONGODB);
  await client.connect();

  const database = client.db(process.env.M_DATABASE);
  const collection = database.collection(process.env.M_COLLECTION);

  return collection;
}

app.get("/", async (req, res) => {
  const expressVersion = require("express/package.json").version;
  const conn = await rawInit();
  const health = await conn.db().admin().command({ serverStatus: 1 });
  res.send({
    mongo: {
      serverTime: health.localTime,
      mongoVersion: health.version,
      uptimeSeconds: health.uptime,
    },
    express: {
      expressVersion: expressVersion,
    },
  });
});

app.get("/random", async (req, res) => {
  const conn = await init();

  var limit = req.query.q;

  if(limit == null) {
    limit = 1
  }

  if(!Number.isInteger(limit)) {
    console.log('not an integer')
    limit = 1
  }

  if(limit > 10){
    console.log('more than 10')
    limit = 10
  }

  console.log("Selecting " + limit)

  const data = conn.aggregate([{ $sample: { size: limit } }]);

  var holder = [];

  await data.forEach((doc) => holder.push(doc));

  res.json({ results: holder });
});

app.post("/search", async (req, res) => {
  const query = {};
  const options = {
    sort: { scrapedAt: -1 },
    limit: 10,
  };

  const conn = await init();
  const data = conn.find(query, options);

  var holder = [];

  await data.forEach((doc) => holder.push(doc));

  res.json({ results: holder });
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
