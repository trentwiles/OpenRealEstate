const express = require("express");
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get("/", async (req, res) => {
  res.render()
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});