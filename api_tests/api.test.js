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

test("valid search, year range", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { yearBuilt: "2000-2000", limit: 1 },
    headers: { Accept: "application/json" },
  });

  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(1);
  expect(http.data.results[0].yearBuilt == 2000).toBe(true);
}, 20000);

test("valid search, owner", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { owner: "smith", limit: 2 },
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(2);
}, 20000);

test("valid search, land use", async () => {
  const http = await axios({
    method: "POST",
    url: "http://localhost:3000/search",
    headers: { "content-type": "application/json" },
    data: { landUse: "MANUFACTURED HOME" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(4);
  expect(
    http.data.results[0].landUse.toLowerCase().includes("manufactured home")
  ).toBe(true);
}, 20000);

test("valid search, taxes", async () => {
  const http = await axios({
    method: "post",
    url: `${BASE_API_URL}/search`,
    data: { taxRange: "0-10000", limit: 4 },
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.results.length).toBe(4);
  expect(http.data.results[0].taxes > 10000).toBe(false);
}, 20000);

test("valid last names query, between 1-100", async () => {
  const http = await axios({
    method: "get",
    url: `${BASE_API_URL}/last-names/${Math.floor((Math.random() * 100) + 1)}`,
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.length).toBe(10);
})

test("valid town name query, between 1-10", async () => {
  const http = await axios({
    method: "get",
    url: `${BASE_API_URL}/town-names/${Math.floor((Math.random() * 10) + 1)}`,
    headers: { Accept: "application/json" },
  });
  expect(http.status).toBe(200);
  expect(http.data.length).toBe(10);
})