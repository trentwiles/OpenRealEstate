const express = require("express");
const { MongoClient, Int32 } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB = `mongodb://${process.env.M_USERNAME}:${process.env.M_PASSWORD}@${process.env.M_SERVER}:27017/`;

const app = express();
app.use(express.json());

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

function isValid(param) {
  return param != null && param != "";
}

function timerangeParse(tre) {
  // should be inputted as NUMBER_X-NUMBER_Y
  // where NUMBER_X < NUMBER_Y
  // assumed to be non-null and non-blank, see queryBuilder function below
  var split = tre.split("-");
  if (split.length != 2) {
    return null;
  }

  var numberX = split[0];
  var numberY = split[1];

  numberX = parseInt(numberX);
  numberY = parseInt(numberY);

  return [numberX, numberY];
}

function handleLimit(limit) {
  if (limit == null || limit == "") {
    limit = 1;
  }

  if (!Number.parseInt(limit)) {
    limit = 1;
  }

  if (limit > 10) {
    limit = 10;
  }

  return parseInt(limit)
}

function queryBuilder(urlParams) {
  query = {};

  // town=example
  if (isValid(urlParams.town)) {
    query["streetAddressDetails.town"] = {
      $regex: urlParams.town,
      $options: "i",
    };
  }

  // zip=071884
  // keep in mind zip is treated as a string
  if (isValid(urlParams.zip)) {
    query["streetAddressDetails.zip"] = {
      $regex: urlParams.zip,
      $options: "i",
    };
  }

  // state=MA
  // keep in mind zip is treated as a string
  if (isValid(urlParams.state)) {
    query["streetAddressDetails.state"] = {
      $regex: urlParams.state,
      $options: "i",
    };
  }

  //time="123-124"
  if (isValid(urlParams.time)) {
    var data = timerangeParse(urlParams.time);
    if (data == null) {
      throw new ValidityState("invalid time range, catch this later");
    }
    query["scrapedAt"] = { $gte: data[0], $lte: data[1] };
  }

  //marketValue="10000-40000"
  if (isValid(urlParams.marketPriceRange)) {
    var data = timerangeParse(urlParams.marketPriceRange);
    if (data == null) {
      throw new ValidityState("invalid market data range, catch this later");
    }
    query["marketValue"] = { $gte: data[0], $lte: data[1] };
  }

  // landUse=forrest
  if (isValid(urlParams.landUse)) {
    query["streetAddressDetails.landUse"] = {
      $regex: urlParams.landUse,
      $options: "i",
    };
  }

  return query;
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

  limit = handleLimit(limit)

  console.log("Selecting " + limit);

  const data = await conn
    .aggregate([{ $sample: { size: Number.parseInt(limit) } }])
    .toArray();

  res.json({ results: data });
});


app.post("/search", async (req, res) => {

  /* BUILDING THE SEARCH QUERY */
  const query = queryBuilder(req.body)
  const limit = handleLimit(req.body.limit)

  console.log("query builder")
  console.log(query)

  const conn = await init();
  const data = conn.find(query).sort({ scrapedAt: -1 }).limit(limit);


  res.json({ results: await data.toArray() });
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

module.exports = { queryBuilder };
