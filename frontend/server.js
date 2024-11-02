const express = require("express");
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/static'));

app.get("/", async (req, res) => {
  res.render('home', { title: "Home" })
});

app.get("/search", async (req, res) => {
  res.render('search', { title: "Search" })
});

app.get("/p/:id/", async (req, res) => {
  res.render("property")
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});