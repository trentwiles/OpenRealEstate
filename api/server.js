const express = require("express");
const { MongoClient, Int32 } = require("mongodb");
const dotenv = require("dotenv");
const winston = require("winston");
const cors = require("cors");
const gem = require("./gem")

dotenv.config();

const MONGODB = `mongodb://${process.env.M_USERNAME}:${process.env.M_PASSWORD}@${process.env.M_SERVER}:27017/`;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const app = express();
app.use(express.json());
app.use(cors());

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

  return parseInt(limit);
}

function queryBuilder(urlParams) {
  query = {};

  // town=example
  if (isValid(urlParams.town)) {
    query["streetAddressDetails.town"] = urlParams.town
  }

  // zip=071884
  // keep in mind zip is treated as a string
  if (isValid(urlParams.zip)) {
    query["streetAddressDetails.zip"] = urlParams.zip
  }

  // state=MA
  // keep in mind zip is treated as a string
  if (isValid(urlParams.state)) {
    query["streetAddressDetails.state"] = urlParams.state
  }

  //time="123-124"
  if (isValid(urlParams.time)) {
    var data = timerangeParse(urlParams.time);
    if (data == null) {
      logger.warn("User passed invalid time range.");
      return {"error": true, "message": "Invalid time"}
      return -1;
    } else {
      query["scrapedAt"] = { $gte: data[0], $lte: data[1] };
    }
  }

  //marketValue="10000-40000"
  if (isValid(urlParams.marketPriceRange)) {
    var data = timerangeParse(urlParams.marketPriceRange);
    if (data == null) {
      logger.warn("User passed invalid market value range.");
      return {"error": true, "message": "Invalid marketPriceRange"}
      return -1;
    } else {
      query["marketValue"] = { $gte: data[0], $lte: data[1] };
    }
  }

  // landUse=forrest
  if (isValid(urlParams.landUse)) {
    query["landUse"] = {
      $regex: urlParams.landUse,
      $options: "i",
    };
  }

  //taxes="1000-40000"
  if (isValid(urlParams.taxes)) {
    var data = timerangeParse(urlParams.taxes);
    if (data == null) {
      logger.warn("User passed invalid tax range.");
      return {"error": true, "message": "Invalid taxes"}
    } else {
      query["taxes"] = { $gte: data[0], $lte: data[1] };
    }
  }

  //landSize="1000-40000"
  // in square meters
  if (isValid(urlParams.landSize)) {
    var data = timerangeParse(urlParams.landSize);
    if (data == null) {
      logger.warn("User passed invalid land size range.");
      return {"error": true, "message": "Invalid landSize"}
    } else {
      query["landSize"] = { $gte: data[0], $lte: data[1] };
    }
  }

  //yearBuilt="1990-2000"
  if (isValid(urlParams.yearBuilt)) {
    var data = timerangeParse(urlParams.yearBuilt);
    if (data == null) {
      logger.warn("User passed invalid market value range.");
      return {"error": true, "message": "Invalid marketPriceRange"}
    } else {
      query["yearBuilt"] = { $gte: data[0], $lte: data[1] };
    }
  }


  if (isValid(urlParams.owner)) {
    // searches each fullName field under owner
    query["owner"] = {
      $elemMatch: {
        $or: [{ fullName: { $regex: urlParams.owner, $options: "i" } }],
      },
    };
  }

  if (query == {}) {
    logger.warn("Search with a blank query.");
  }

  console.log(query)

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

  limit = handleLimit(limit);

  console.log("Selecting " + limit);

  const data = await conn
    .aggregate([{ $sample: { size: Number.parseInt(limit) } }])
    .toArray();

  res.json({ results: data });
});

app.post("/search", async (req, res) => {
  /* BUILDING THE SEARCH QUERY */
  const query = queryBuilder(req.body);

  if(query["error"] != null) {
    return res.status(400).json(query)
  }

  const limit = handleLimit(req.body.limit);

  const conn = await init();
  const data = conn.find(query).sort({ scrapedAt: -1 }).limit(limit);

  res.json({ results: await data.toArray() });
});

app.get("/property", async (req, res) => {
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

app.post("/summary", async (req, res) => {
  const data = req.query.data
  const result = await gem.transactionHistorySummary(data)
  return res.json({"raw": result})
})

/* ADMIN FUNCTIONS */
/* MUST contain the admin key in the post body (as defined in .env) */

app.post("/cleanDatabase", async (req, res) => {
  /* TODO: remove all duplicate lightbox IDs */
  logger.info("Admin ran 'cleanDatabase'")
  res.json({})
})

app.post("/wipeDatabase", async (req, res) => {
  /* TODO: wipe all properties */
  logger.info("Admin ran 'wipeDatabase'")
  res.json({})
})

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

module.exports = { queryBuilder };
