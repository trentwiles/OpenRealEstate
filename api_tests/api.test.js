const axios = require("axios");

const BASE_API_URL = "http://localhost:3000";

test("get request to /", async () => {
  const http = await axios({
    method: "get",
    url: `${BASE_API_URL}/`,
  });
  expect(http.status).toBe(200);
  expect(http.data.mongo.uptimeSeconds > 0).toBe(true);
});

test("valid search, one parameter, default length of one", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { state: "CT" },
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(1);
}, 20000);

test("valid search, one parameter, custom length of five", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { state: "CT", limit: 5 },
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(5);
  expect(http.data.results[0].streetAddressDetails.state == "CT").toBe(true);
}, 20000);

test("valid search, two parameters, default length", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { state: "CT", town: "Branford" },
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(1);
  expect(http.data.results[0].streetAddressDetails.town == "Branford").toBe(
    true
  );
}, 20000);

test("valid search, one parameters, length more than 10", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { state: "CA", limit: 100 },
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(10);
  expect(http.data.results[0].streetAddressDetails.state == "CA").toBe(true);
}, 20000);

test("valid id request", async () => {
  const http = await axios({
    method: "get",
    url: `${BASE_API_URL}/id?id=5b8a53b0-20e0-463a-8953-0d0d5a17f804`,
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(1);
  expect(
    http.data.results[0].id == "5b8a53b0-20e0-463a-8953-0d0d5a17f804"
  ).toBe(true);
}, 20000);
