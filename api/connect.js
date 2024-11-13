const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();

const MONGODB = `mongodb://${process.env.M_USERNAME}:${process.env.M_PASSWORD}@${process.env.M_SERVER}:27017/`;

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

async function initCustom(col) {
  const client = new MongoClient(MONGODB);
  await client.connect();

  const database = client.db(process.env.M_DATABASE);
  const collection = database.collection(col);

  return collection;
}

module.exports = { rawInit, init, initCustom }