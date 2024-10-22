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

  var limit = req.query.limit;

  if (limit == null || limit == "") {
    limit = 1;
  }

  if (!Number.parseInt(limit)) {
    limit = 1;
  }

  if (limit > 10) {
    limit = 10;
  }

  console.log("Selecting " + limit);

  const data = await conn.aggregate([{ $sample: { size: Number.parseInt(limit) } }]).toArray();

  res.json({ results: data });
});

app.post("/search", async (req, res) => {
  /* EXTRACTING OUT THE SEARCH QUERY */

  /* BUILDING THE SEARCH QUERY */
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

app.get("/id", async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res
      .status(400)
      .json({ error: true, status: "Missing ID parameter" });
  }

  const query = { id: id };

  const options = {
    sort: { scrapedAt: -1 },
    limit: 1,
  };

  const conn = await init();
  const data = await conn.find(query, options).toArray();
  res.json({ results: data });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
