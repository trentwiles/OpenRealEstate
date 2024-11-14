const connect = require("./connect.js")
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');

const timer = setIntervalAsync(async () => {
  console.log('Hello')
  await connect.init()
  console.log('Bye')
}, 1000);
