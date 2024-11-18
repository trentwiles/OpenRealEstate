const express = require("express");
const { ObjectId } = require("bson");
const winston = require("winston");
const cors = require("cors");
const gem = require("./gem");
const connect = require("./connect.js");
const fs = require("fs");
const path = require('path');

const cacheFilePath = path.join(__dirname, 'cache.json');

if (!fs.existsSync(cacheFilePath)) {
  fs.writeFileSync(cacheFilePath, JSON.stringify({}), 'utf8');
  console.log('Notice: cache.json was not found, it was created');
}
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const app = express();
app.use(express.json());
app.use(cors());

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
    query["streetAddressDetails.town"] = urlParams.town;
  }

  // zip=071884
  // keep in mind zip is treated as a string
  if (isValid(urlParams.zip)) {
    query["streetAddressDetails.zip"] = urlParams.zip;
  }

  // state=MA
  // keep in mind zip is treated as a string
  if (isValid(urlParams.state)) {
    query["streetAddressDetails.state"] = urlParams.state;
  }

  //time="123-124"
  if (isValid(urlParams.time)) {
    var data = timerangeParse(urlParams.time);
    if (data == null) {
      logger.warn("User passed invalid time range.");
      return { error: true, message: "Invalid time" };
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
      return { error: true, message: "Invalid marketPriceRange" };
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
      return { error: true, message: "Invalid taxes" };
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
      return { error: true, message: "Invalid landSize" };
    } else {
      query["landSize"] = { $gte: data[0], $lte: data[1] };
    }
  }

  //yearBuilt="1990-2000"
  if (isValid(urlParams.yearBuilt)) {
    var data = timerangeParse(urlParams.yearBuilt);
    if (data == null) {
      logger.warn("User passed invalid market value range.");
      return { error: true, message: "Invalid marketPriceRange" };
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

  console.log(query);

  return query;
}

app.get("/", async (req, res) => {
  const expressVersion = require("express/package.json").version;
  const conn = await connect.rawInit();
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
  const conn = await connect.init();

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

  if (query["error"] != null) {
    return res.status(400).json(query);
  }

  const limit = handleLimit(req.body.limit);

  const conn = await connect.init();
  const data = conn.find(query).sort({ scrapedAt: -1 }).limit(limit);

  res.json({ results: await data.toArray() });
});

app.post("/property", async (req, res) => {
  const id = req.body.id;

  if (!id || id == null || id == undefined) {
    return res
      .status(400)
      .json({ error: true, status: "Missing ID parameter" });
  }

  // id is base64 encoded on the frontend, so decode it
  const realID = Buffer.from(id, "base64").toString("utf-8");
  const query = { _id: new ObjectId(realID) };

  console.log(query);

  const options = {
    sort: { scrapedAt: -1 },
    limit: 1,
  };

  const conn = await connect.init();
  const data = await conn.find(query, options).toArray();
  res.json({ results: data });
});

app.post("/summary", async (req, res) => {
  const data = req.query.data;
  const result = await gem.transactionHistorySummary(data);
  return res.json({ raw: result });
});

app.get("/towns", async (req, res) => {
  const conn = await connect.init();
  const data = await conn.distinct("streetAddressDetails.town");
  return res.json({ towns: data.filter((town) => town !== "") });
});

app.get("/last-names/:page", async (req, res) => {
  var page = parseInt(req.params.page);
  var pageSize = 10;

  if (page < 1) {
    return res.json({ error: true, message: "'page' is too small" });
  }

  const conn = await connect.initCustom("lastNames");
  const results = await conn
    .find({}, { projection: { _id: 0 } })
    .sort({ lastName: 1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .toArray();

  return res.json(results);
});

app.get("/town-names/:page", async (req, res) => {
  var page = parseInt(req.params.page);
  var pageSize = 10;

  if (page < 1) {
    return res.json({ error: true, message: "'page' is too small" });
  }

  const conn = await connect.initCustom("townNames");
  const results = await conn
    .find({}, { projection: { _id: 0 } })
    .sort({ townName: 1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .toArray();

  return res.json(results);
});

/* PDF EXPORT FUNCTIONS */
/* Includes job creation, job updates, and job completion */
app.post("/newExportJob", async (req, res) => {
  // assume this is in the base 64 encoded format
  const id = req.body.id;
  if (!id || id == null || id == "" || id == undefined) {
    return res.send(400);
  }

  const idDecoded = Buffer.from(id, "base64").toString("utf-8");
  // no captcha for now, future?

  const conn = await connect.initCustom("batchJobs");
  const data = {
    idDecoded: idDecoded,
    isCompleted: false,
    downloadLink: null,
    internalPath: null,
    requestedAt: Math.floor(Date.now() / 1000),
  };
  const result = await conn.insertOne(data);

  console.log(result);
  return res.json({ success: true, jobID: result.insertedId });
});

app.get("/getJobStatus/:id", async (req, res) => {
  // query the mongodb database for the job

  const id = req.params.id;
  if (!id || id == null || id == "" || id == undefined) {
    return res.send(400);
  }

  const conn = await connect.initCustom("batchJobs");
  var result = null;
  try {
    result = await conn.find({ _id: new ObjectId(id) }).toArray();
  } catch (error) {
    return res.status(404).json({
      message: "job not found",
    });
  }

  var formattedResult;
  var status;

  try {
    status = 200;
    formattedResult = {
      isCompleted: result[0]["isCompleted"],
      downloadLink: result[0]["downloadLink"],
    };
  } catch {
    status = 404;
    formattedResult = {
      message: "job not found",
    };
  }

  console.log(formattedResult);

  return res.status(status).json(formattedResult);
});

/* ADMIN FUNCTIONS */
/* MUST contain the admin key in the post body (as defined in .env) */

app.post("/cleanDatabase", async (req, res) => {
  console.log(req.body);

  if (req.body.key != process.env.ADMIN_TOKEN) {
    logger.warn("Unauthorized login attempt on admin method 'cleanDatabase'");
    return res.status(401).send("unauthorized");
  }

  const conn = await connect.init();

  /* Collect items with duplicate Lightbox ID */
  const duplicates = await conn.aggregate([
    {
      $group: {
        _id: "$lightboxParcelID",
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        ids: { $slice: ["$ids", 1, { $subtract: ["$count", 1] }] },
      },
    },
  ]);

  /* Push them to format MongoDB understands, then destroy */
  const bulkOps = [];
  duplicates.forEach((doc) => {
    bulkOps.push({
      deleteMany: { filter: { _id: { $in: doc.ids } } },
    });
  });

  if (bulkOps.length > 0) {
    db.collection.bulkWrite(bulkOps);
  }

  logger.info(
    "Admin ran 'cleanDatabase' (" + bulkOps.length + " records destroyed)"
  );
  return res.json(duplicates.toArray());
});

app.post("/wipeDatabase", async (req, res) => {
  console.log(req.body);
  if (req.body["key"] != process.env.ADMIN_TOKEN) {
    logger.warn("Unauthorized login attempt on admin method 'wipeDatabase'");
    return res.status(401).send("unauthorized");
  }
  /* TODO: wipe all properties */
  logger.info("Admin ran 'wipeDatabase'");
  res.json({});
});

/*=============================================
            Statistic Related Methods
 *============================================*/

//
app.get("/stats", async (req, res) => {
  // before anything, check if file is in cache
  /*
  {
    "records": 0,
    "cachedAt": 1600000
  }
  */
  
  const contents = fs.readFileSync('cache.json').toString()

  if (contents != undefined && contents != null && contents != "" && contents != "{}") {
    const data = JSON.parse(contents)
    const age = data.age
    const epochTime = Math.floor(Date.now() / 1000);
    const ageRange = epochTime - age

    if(ageRange < (60 * 60 * 12)) {
      // only continue if age is less than 12 hours

      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Age', ageRange)
      return res.json( {total: data.total})
    }
  }

  // Either the file wasn't opened, or the cache was expired

  const conn = await connect.init();
  const count = await conn.countDocuments();

  fs.writeFileSync(cacheFilePath, JSON.stringify({"total": count, "age": Math.floor(Date.now() / 1000)}), 'utf8');

  res.setHeader('X-Cache', 'MISS');
  return res.json({ total: count });
});

app.post("/generateTownList", async (req, res) => {
  if (req.body["key"] != process.env.ADMIN_TOKEN) {
    logger.warn("Unauthorized login attempt on admin method 'wipeDatabase'");
    return res.status(401).send("unauthorized");
  }

  const conn = await connect.init()
  const result = await conn.distinct("streetAddressDetails.town")

  const townConn = await connect.initCustom("townNames")

  // first delete everything
  await townConn.deleteMany({})

  result.forEach((town) => {
    townConn.insertOne({"townName": town})
  })

  return res.json({})
})

/*
  Missing: last names method...
*/

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

module.exports = { queryBuilder };
